"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [showMask, setShowMask] = useState(false)
  const [maskPos, setMaskPos] = useState(0)
  const [showRuler, setShowRuler] = useState(false)
  const [rulerPos, setRulerPos] = useState(0)
  const [showTranslate, setShowTranslate] = useState(false)

  useEffect(() => {
    const storedSize = localStorage.getItem("a11y-font")
    const storedContrast = localStorage.getItem("a11y-contrast")
    if (storedSize) {
      setFontSize(parseInt(storedSize))
    }
    if (storedContrast) {
      setHighContrast(storedContrast === "true")
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
    localStorage.setItem("a11y-font", fontSize.toString())
  }, [fontSize])

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast)
    localStorage.setItem("a11y-contrast", String(highContrast))
  }, [highContrast])

  useEffect(() => {
    if (showMask) {
      const move = (e: MouseEvent) => setMaskPos(e.clientY)
      window.addEventListener("mousemove", move)
      return () => window.removeEventListener("mousemove", move)
    }
  }, [showMask])

  useEffect(() => {
    if (showRuler) {
      const move = (e: MouseEvent) => setRulerPos(e.clientY)
      window.addEventListener("mousemove", move)
      return () => window.removeEventListener("mousemove", move)
    }
  }, [showRuler])

  useEffect(() => {
    if (showTranslate && !(window as any).googleTranslateElementInit) {
      ;(window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_element"
        )
      }
      const script = document.createElement("script")
      script.id = "google_translate_script"
      script.src =
        "https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit"
      document.body.appendChild(script)
    }
  }, [showTranslate])

  const speak = () => {
    const text =
      window.getSelection()?.toString() || document.body.innerText
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const increaseFont = () => setFontSize((f) => Math.min(f + 10, 200))
  const decreaseFont = () => setFontSize((f) => Math.max(f - 10, 50))
  const resetFont = () => setFontSize(100)

  return (
    <>
      {showMask && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: maskPos - 100,
              background: "rgba(0,0,0,0.6)",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: maskPos + 100,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />
        </>
      )}
      {showRuler && (
        <div
          style={{
            position: "fixed",
            top: rulerPos - 15,
            left: 0,
            width: "100%",
            height: 30,
            background: "rgba(255,255,0,0.3)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
      <div className="fixed bottom-4 right-4 z-[10000]">
        {open && (
          <div className="mb-2 p-4 bg-white dark:bg-gray-800 rounded-md shadow-md space-y-2 w-64">
            <div className="flex gap-2">
              <Button size="sm" onClick={increaseFont} aria-label="Increase font size">
                A+
              </Button>
              <Button size="sm" onClick={decreaseFont} aria-label="Decrease font size">
                A-
              </Button>
              <Button size="sm" onClick={resetFont} aria-label="Reset font size">
                A
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={speak} aria-label="Read text">
                Speak
              </Button>
              <Button
                size="sm"
                onClick={() => setHighContrast((h) => !h)}
                aria-pressed={highContrast}
                aria-label="Toggle high contrast"
              >
                Contrast
              </Button>
              <Button
                size="sm"
                onClick={() => setShowMask((m) => !m)}
                aria-pressed={showMask}
                aria-label="Toggle screen mask"
              >
                Mask
              </Button>
              <Button
                size="sm"
                onClick={() => setShowRuler((r) => !r)}
                aria-pressed={showRuler}
                aria-label="Toggle reading ruler"
              >
                Ruler
              </Button>
              <Button
                size="sm"
                onClick={() => setShowTranslate((t) => !t)}
                aria-pressed={showTranslate}
                aria-label="Toggle translation"
              >
                Translate
              </Button>
            </div>
            {showTranslate && <div id="google_translate_element" />}
          </div>
        )}
        <Button size="sm" onClick={() => setOpen((o) => !o)} aria-label="Toggle accessibility toolbar">
          Accessibility
        </Button>
      </div>
    </>
  )
}

export default AccessibilityToolbar