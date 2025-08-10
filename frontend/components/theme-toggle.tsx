"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
    window.dispatchEvent(new Event("theme-change"))
  }

  if (!mounted) {
    return <div className={cn("h-6 w-11", className)} />
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sun className={cn("h-4 w-4", isDark && "text-muted-foreground")} />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
      />
      <Moon className={cn("h-4 w-4", !isDark && "text-muted-foreground")} />
    </div>
  )
}
