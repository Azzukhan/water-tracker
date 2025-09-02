// components/accessibility-toolbar.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useA11y } from "@/components/a11y-provider"
import {
  Volume2, Minus, Plus, Type, Globe,
  Contrast as ContrastIcon, Ruler, Square,
  MousePointer2, RotateCcw, X
} from "lucide-react"

const TOOLBAR_HEIGHT = 56

// broader but safe: includes semantic + ARIA + controls
const SPEAKABLE_SELECTOR = [
  "a", "button", "[role='button']",
  "p", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "label", "summary",
  "input", "textarea", "select",
  "img[alt]", "svg[aria-label]",
  "[aria-label]", "[aria-labelledby]", "[title]"
].join(",")

// --- util: get accessible text for an element ---
function getAccessibleText(el: Element | null): string {
  if (!el) return ""

  const element = el as HTMLElement

  // 1) aria-label
  const ariaLabel = element.getAttribute?.("aria-label")
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim()

  // 2) aria-labelledby
  const labelledBy = element.getAttribute?.("aria-labelledby")
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/)
    const txt = ids
      .map(id => document.getElementById(id)?.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
    if (txt) return txt
  }

  // 3) title
  const titleAttr = element.getAttribute?.("title")
  if (titleAttr && titleAttr.trim()) return titleAttr.trim()

  // 4) role-based / tag-specific
  const tag = element.tagName.toLowerCase()

  // images
  if (tag === "img") {
    const alt = (element as HTMLImageElement).alt
    if (alt && alt.trim()) return alt.trim()
  }

  // inputs, selects, textareas
  if (tag === "input") {
    const inp = element as HTMLInputElement
    // label text via <label for="...">
    if (inp.id) {
      const label = document.querySelector(`label[for="${CSS.escape(inp.id)}"]`) as HTMLElement | null
      if (label?.innerText) return label.innerText.replace(/\s+/g, " ").trim()
    }
    // placeholder/value
    if (inp.placeholder) return inp.placeholder.trim()
    if (inp.type === "button" || inp.type === "submit" || inp.type === "reset") {
      if (inp.value) return inp.value.trim()
    }
  }
  if (tag === "textarea") {
    const ta = element as HTMLTextAreaElement
    if (ta.placeholder) return ta.placeholder.trim()
  }
  if (tag === "select") {
    const sel = element as HTMLSelectElement
    const selected = sel.options[sel.selectedIndex]
    if (selected?.label) return selected.label.trim()
  }

  // buttons or links with icons only often have aria-label handled above
  // else fall back to text content
  const raw = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim()
  if (raw) return raw

  return ""
}

// simple length guard to avoid huge containers
function isReasonableLength(text: string) {
  const len = text.length
  return len >= 2 && len <= 300
}

export function AccessibilityToolbar() {
  const { open, setOpen } = useA11y()
  const [confirmClose, setConfirmClose] = useState(false)

  const [fontSize, setFontSize] = useState<number>(() => {
    const s = typeof window !== "undefined" ? localStorage.getItem("a11y-font") : null
    return s ? parseInt(s) : 100
  })
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexic, setDyslexic] = useState(false)
  const [largeCursor, setLargeCursor] = useState(false)
  const [showMask, setShowMask] = useState(false)
  const [maskPos, setMaskPos] = useState(0)
  const [showRuler, setShowRuler] = useState(false)
  const [rulerPos, setRulerPos] = useState(0)
  const [showTranslate, setShowTranslate] = useState(false)
  const [hoverReadOn, setHoverReadOn] = useState(false)

  const debounceRef = useRef<number | null>(null)
  const lastSpokenRef = useRef<string>("")

  // persist + apply
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
    localStorage.setItem("a11y-font", String(fontSize))
  }, [fontSize])
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast)
  }, [highContrast])
  useEffect(() => {
    document.body.classList.toggle("dyslexic-font", dyslexic)
  }, [dyslexic])
  useEffect(() => {
    document.body.classList.toggle("large-cursor", largeCursor)
  }, [largeCursor])

  // overlays
  useEffect(() => {
    if (!showMask && !showRuler) return
    const move = (e: MouseEvent) => {
      if (showMask) setMaskPos(e.clientY)
      if (showRuler) setRulerPos(e.clientY)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [showMask, showRuler])

  // google translate
  useEffect(() => {
    if (!showTranslate) return
    const id = "google_translate_script"
    if (document.getElementById(id)) return
    ;(window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_element"
        )
      } catch {}
    }
    const s = document.createElement("script")
    s.id = id
    s.src = "https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit"
    document.body.appendChild(s)
  }, [showTranslate])

  // speaking
  const speakText = (text: string) => {
    if (!isReasonableLength(text)) return
    if (text === lastSpokenRef.current) return
    lastSpokenRef.current = text

    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utter)
  }

  const scheduleSpeak = (text: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => speakText(text), 120)
  }

  const handleHover = (e: Event) => {
    if (!hoverReadOn) return
    const target = e.target as HTMLElement
    const el = target?.closest(SPEAKABLE_SELECTOR)
    if (!el) return
    const txt = getAccessibleText(el)
    if (isReasonableLength(txt)) scheduleSpeak(txt)
  }

  const handleHoverLeave = () => {
    if (!hoverReadOn) return
    // pause when leaving, so moving between items feels natural
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
    }
  }

  useEffect(() => {
    if (!hoverReadOn) {
      window.speechSynthesis.cancel()
      return
    }
    document.addEventListener("mouseover", handleHover, true)
    document.addEventListener("mouseout", handleHoverLeave, true)
    document.addEventListener("focusin", handleHover, true)
    document.addEventListener("focusout", handleHoverLeave, true)
    return () => {
      document.removeEventListener("mouseover", handleHover, true)
      document.removeEventListener("mouseout", handleHoverLeave, true)
      document.removeEventListener("focusin", handleHover, true)
      document.removeEventListener("focusout", handleHoverLeave, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverReadOn])

  // reset & close
  const resetAll = () => {
    setFontSize(100)
    setHighContrast(false)
    setDyslexic(false)
    setLargeCursor(false)
    setShowMask(false)
    setShowRuler(false)
    setShowTranslate(false)
    setHoverReadOn(false)
    lastSpokenRef.current = ""
    window.speechSynthesis.cancel()
    const el = document.getElementById("google_translate_element")
    if (el) el.innerHTML = ""
  }
  const confirmCloseYes = () => {
    setConfirmClose(false)
    resetAll()
    setOpen(false)
  }

  // toolbar button
  const TB = ({
    pressed,
    onClick,
    label,
    children,
  }: {
    pressed?: boolean
    onClick: () => void
    label: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      className="a11y-btn h-9 w-9 shrink-0"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      title={label}
    >
      {children}
    </button>
  )

  return (
    <>
      {/* overlays */}
      {showMask && (
        <>
          <div
            style={{
              position: "fixed",
              top: TOOLBAR_HEIGHT, left: 0, right: 0,
              height: Math.max(maskPos - 100 - TOOLBAR_HEIGHT, 0),
              background: "rgba(0,0,0,0.55)",
              pointerEvents: "none",
              zIndex: 9996,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: maskPos + 100, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.55)",
              pointerEvents: "none",
              zIndex: 9996,
            }}
          />
        </>
      )}
      {showRuler && (
        <div
          style={{
            position: "fixed",
            top: Math.max(rulerPos - 16, TOOLBAR_HEIGHT),
            left: 0, width: "100%", height: 32,
            background: "rgba(255, 255, 0, 0.35)",
            pointerEvents: "none",
            zIndex: 9997,
          }}
        />
      )}

      {open && (
        <div className="a11y-toolbar" role="region" aria-label="Accessibility toolbar">
          <div className="a11y-toolbar-inner" role="toolbar">
            {/* Hover Read toggle */}
            <TB label={hoverReadOn ? "Hover Read: On" : "Hover Read: Off"} pressed={hoverReadOn} onClick={() => {
              lastSpokenRef.current = ""
              setHoverReadOn(v => !v)
            }}>
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            </TB>

            <span className="a11y-sep" aria-hidden="true" />

            {/* Font size */}
            <TB label="Decrease text size" onClick={() => setFontSize(v => Math.max(v - 10, 50))}>
              <Minus className="h-4 w-4" aria-hidden="true" />
            </TB>
            <TB label="Increase text size" onClick={() => setFontSize(v => Math.min(v + 10, 200))}>
              <Plus className="h-4 w-4" aria-hidden="true" />
            </TB>

            {/* Dyslexic font */}
            <TB label="Dyslexic-friendly font" pressed={dyslexic} onClick={() => setDyslexic(v => !v)}>
              <Type className="h-4 w-4" aria-hidden="true" />
            </TB>

            <span className="a11y-sep" aria-hidden="true" />

            {/* Translate */}
            <TB label="Translate" pressed={showTranslate} onClick={() => setShowTranslate(v => !v)}>
              <Globe className="h-4 w-4" aria-hidden="true" />
            </TB>

            {/* High contrast */}
            <TB label="High contrast" pressed={highContrast} onClick={() => setHighContrast(v => !v)}>
              <ContrastIcon className="h-4 w-4" aria-hidden="true" />
            </TB>

            {/* Ruler + Mask */}
            <TB label="Reading ruler" pressed={showRuler} onClick={() => setShowRuler(v => !v)}>
              <Ruler className="h-4 w-4" aria-hidden="true" />
            </TB>
            <TB label="Screen mask" pressed={showMask} onClick={() => setShowMask(v => !v)}>
              <Square className="h-4 w-4" aria-hidden="true" />
            </TB>

            {/* Large cursor */}
            <TB label="Large cursor" pressed={largeCursor} onClick={() => setLargeCursor(v => !v)}>
              <MousePointer2 className="h-4 w-4" aria-hidden="true" />
            </TB>

            <span className="a11y-sep" aria-hidden="true" />

            {/* Reset */}
            <TB label="Reset all" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </TB>

            {/* Close */}
            <button
              type="button"
              className="ml-auto a11y-btn h-9 w-9 shrink-0"
              aria-label="Close toolbar"
              onClick={() => setConfirmClose(true)}
              title="Close toolbar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {showTranslate && (
            <div className="mx-auto max-w-screen-2xl px-3 pb-2">
              <div id="google_translate_element" className="inline-block bg-white text-black rounded-md px-2 py-1" />
            </div>
          )}
        </div>
      )}

      {confirmClose && (
        <>
          <div className="a11y-modal-backdrop" aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="a11y-modal">
            <h3>ABOUT TO CLOSE!</h3>
            <p>You are about to close the accessibility toolbar. Are you sure you wish to continue?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmClose(false)} className="px-3 py-1 bg-gray-200 rounded-md">
                Cancel
              </button>
              <button onClick={confirmCloseYes} className="px-3 py-1 bg-blue-600 text-white rounded-md">
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default AccessibilityToolbar
