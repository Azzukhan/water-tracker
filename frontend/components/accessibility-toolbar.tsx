"use client"

import { useEffect, useRef, useState } from "react"
import { useA11y } from "@/components/a11y-provider"
import {
  Volume2, Minus, Plus, Type, Globe,
  Contrast as ContrastIcon, Ruler, Square,
  MousePointer2, RotateCcw, X, Palette
} from "lucide-react"

const TOOLBAR_HEIGHT = 56

const SPEAKABLE_SELECTOR = [
  "a", "button", "[role='button']",
  "p", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "label", "summary",
  "input", "textarea", "select",
  "img[alt]", "svg[aria-label]",
  "[aria-label]", "[aria-labelledby]", "[title]"
].join(",")

function getAccessibleText(el: Element | null): string {
  if (!el) return ""
  const element = el as HTMLElement

  const ariaLabel = element.getAttribute?.("aria-label")
  if (ariaLabel?.trim()) return ariaLabel.trim()

  const labelledBy = element.getAttribute?.("aria-labelledby")
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/)
    const txt = ids.map(id => document.getElementById(id)?.textContent || "")
      .join(" ").replace(/\s+/g, " ").trim()
    if (txt) return txt
  }

  const titleAttr = element.getAttribute?.("title")
  if (titleAttr?.trim()) return titleAttr.trim()

  const tag = element.tagName.toLowerCase()
  if (tag === "img") {
    const alt = (element as HTMLImageElement).alt
    if (alt?.trim()) return alt.trim()
  }
  if (tag === "input") {
    const inp = element as HTMLInputElement
    if (inp.id) {
      const label = document.querySelector(`label[for="${CSS.escape(inp.id)}"]`) as HTMLElement | null
      if (label?.innerText) return label.innerText.replace(/\s+/g, " ").trim()
    }
    if (inp.placeholder) return inp.placeholder.trim()
    if (["button", "submit", "reset"].includes(inp.type) && inp.value) return inp.value.trim()
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

  const raw = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim()
  return raw || ""
}

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

  const colorBlindModes = ['off', 'deuteranopia', 'protanopia', 'tritanopia'] as const
  type ColorBlindMode = typeof colorBlindModes[number]
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>('off')

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

  // apply color-blind filter to content wrapper (not <body>)
  useEffect(() => {
    document.body.style.filter = "" // safety: never leave body filtered
    const node = document.getElementById("a11y-filter-root")
    if (!node) return
    if (colorBlindMode !== "off") {
      node.style.filter = `url(#${colorBlindMode})`
      node.style.transition = "filter 0.3s ease"
    } else {
      node.style.filter = ""
    }
  }, [colorBlindMode])

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
        new (window as any).google.translate.TranslateElement({ pageLanguage: "en" }, "google_translate_element")
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
    setColorBlindMode("off")
    lastSpokenRef.current = ""
    window.speechSynthesis.cancel()
    const el = document.getElementById("google_translate_element")
    if (el) el.innerHTML = ""
    const node = document.getElementById("a11y-filter-root")
    if (node) node.style.filter = ""
  }

  const confirmCloseYes = () => {
    // 1) close immediately (and persist)
    try { localStorage.setItem("a11y-open", "false") } catch {}
    setOpen(false)

    // 2) tidy up state & visuals
    setConfirmClose(false)
    resetAll()

    // 3) blur any focused control to avoid re-open via key events
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

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
      className="a11y-btn h-9 w-9 shrink-0 transition-colors duration-200 hover:bg-blue-100 active:bg-blue-200"
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
      {/* Color blind filters (defs) */}
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

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
              transition: "height 0.1s ease",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: maskPos + 100, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.55)",
              pointerEvents: "none",
              zIndex: 9996,
              transition: "top 0.1s ease",
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
            transition: "top 0.1s ease",
          }}
        />
      )}

      {open && (
        <div className="a11y-toolbar" role="region" aria-label="Accessibility toolbar">
          <div className="a11y-toolbar-inner" role="toolbar">
            {/* Hover Read */}
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

            {/* Color blind cycle */}
            <TB
              label={`Color blind mode: ${colorBlindMode === 'off' ? 'Off' : colorBlindMode.charAt(0).toUpperCase() + colorBlindMode.slice(1)}`}
              pressed={colorBlindMode !== 'off'}
              onClick={() => {
                const currentIndex = colorBlindModes.indexOf(colorBlindMode)
                const nextMode = colorBlindModes[(currentIndex + 1) % colorBlindModes.length]
                setColorBlindMode(nextMode)
              }}
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
            </TB>

            <span className="a11y-sep" aria-hidden="true" />

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
              className="ml-auto a11y-btn h-9 w-9 shrink-0 transition-colors duration-200 hover:bg-blue-100 active:bg-blue-200"
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
