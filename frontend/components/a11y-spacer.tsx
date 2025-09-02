// components/a11y-spacer.tsx
"use client"

import { useA11y } from "@/components/a11y-provider"

export default function A11ySpacer() {
  const { open } = useA11y()
  return <div aria-hidden className={open ? "h-[56px]" : "h-0"} />
}
