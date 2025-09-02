// components/a11y-provider.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type A11yContextValue = { open: boolean; setOpen: (v: boolean) => void }
const A11yContext = createContext<A11yContextValue | null>(null)

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const stored = localStorage.getItem("a11y-open")
    return stored ? stored === "true" : true
  })

  useEffect(() => {
    localStorage.setItem("a11y-open", String(open))
    document.documentElement.dataset.a11yOpen = open ? "true" : "false"
  }, [open])

  return <A11yContext.Provider value={{ open, setOpen }}>{children}</A11yContext.Provider>
}

export function useA11y() {
  const ctx = useContext(A11yContext)
  if (!ctx) throw new Error("useA11y must be used inside <A11yProvider>")
  return ctx
}
