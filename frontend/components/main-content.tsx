"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.focus()
  }, [pathname])

  return (
    <main id="main-content" ref={mainRef} tabIndex={-1}>
      {children}
    </main>
  )
}
