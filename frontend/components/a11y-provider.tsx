"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type A11yContextValue = { open: boolean; setOpen: (v: boolean) => void }
const A11yContext = createContext<A11yContextValue | null>(null)

/**
 * Keeps accessibility toolbar open/closed state in localStorage ("a11y-open").
 * Default is CLOSED. We read persisted value on first client mount.
 */
export function A11yProvider({ children }: { children: React.ReactNode }) {
  // Default closed
  const [open, setOpen] = useState<boolean>(false)

  // On first client mount, sync with persisted value (if any)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("a11y-open")
      if (stored !== null) {
        setOpen(stored === "true")
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist & expose data attribute for CSS (e.g., spacers)
  useEffect(() => {
    try {
      localStorage.setItem("a11y-open", String(open))
    } catch {
      // ignore
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
