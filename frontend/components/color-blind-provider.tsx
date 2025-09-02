// components/color-blind-provider.tsx
"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type CbCtx = { isCb: boolean; toggleCb: () => void }
const CbContext = createContext<CbCtx | null>(null)

export function ColorBlindProvider({ children }: { children: React.ReactNode }) {
  const [isCb, setIsCb] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("cb-mode") === "1"
  })

  useEffect(() => {
    localStorage.setItem("cb-mode", isCb ? "1" : "0")
    // Toggle a root class so your Tailwind “cb:” variants work
    document.documentElement.classList.toggle("cb", isCb)
  }, [isCb])

  const value = useMemo(() => ({ isCb, toggleCb: () => setIsCb((v) => !v) }), [isCb])
  return <CbContext.Provider value={value}>{children}</CbContext.Provider>
}

export function useColorBlind() {
  const ctx = useContext(CbContext)
  if (!ctx) throw new Error("useColorBlind must be used inside <ColorBlindProvider>")
  return ctx
}
