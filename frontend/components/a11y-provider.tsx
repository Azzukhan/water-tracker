"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type A11yContextValue = { open: boolean; setOpen: (v: boolean) => void }
const A11yContext = createContext<A11yContextValue | null>(null)

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("a11y-open")
      if (stored !== null) {
        setOpen(stored === "true")
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("a11y-open", String(open))
    } catch {
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.a11yOpen = open ? "true" : "false"
    }
  }, [open])

  const value = useMemo(() => ({ open, setOpen }), [open])

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>
}

export function useA11y() {
  const ctx = useContext(A11yContext)
  if (!ctx) throw new Error("useA11y must be used inside <A11yProvider>")
  return ctx
}
