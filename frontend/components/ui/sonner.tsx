"use client"

import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"
import type React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<ToasterProps["theme"]>("light")

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      )
    }
    handleThemeChange()
    window.addEventListener("theme-change", handleThemeChange)
    return () => window.removeEventListener("theme-change", handleThemeChange)
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
