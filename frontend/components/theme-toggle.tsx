"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn("h-6 w-11", className)} />
  }

  const isDark = theme === "dark"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sun className={cn("h-4 w-4", isDark && "text-muted-foreground")} />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle theme"
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
      />
      <Moon className={cn("h-4 w-4", !isDark && "text-muted-foreground")} />
    </div>
  )
}
