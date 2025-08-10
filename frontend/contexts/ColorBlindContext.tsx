"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface ColorBlindContextValue {
  isColorBlind: boolean
  toggleColorBlind: () => void
}

export const ColorBlindContext = createContext<ColorBlindContextValue | undefined>(
  undefined,
)

export function ColorBlindProvider({ children }: { children: React.ReactNode }) {
  const [isColorBlind, setIsColorBlind] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("colorBlindEnabled")
    if (stored) {
      setIsColorBlind(stored === "true")
    }
  }, [])

  // Persist and update root class
  useEffect(() => {
    document.documentElement.classList.toggle("color-blind", isColorBlind)
    localStorage.setItem("colorBlindEnabled", isColorBlind ? "true" : "false")
  }, [isColorBlind])

  const toggleColorBlind = () => setIsColorBlind((v) => !v)

  return (
    <ColorBlindContext.Provider value={{ isColorBlind, toggleColorBlind }}>
      {children}
    </ColorBlindContext.Provider>
  )
}

export function useColorBlind() {
  const context = useContext(ColorBlindContext)
  if (!context) {
    throw new Error("useColorBlind must be used within a ColorBlindProvider")
  }
  return context
}

