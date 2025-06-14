"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Droplets, Phone, Mail, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Water Levels", href: "/water-levels" },
  { name: "Weather", href: "/weather" },
  { name: "News", href: "/news" },
  { name: "Blogs", href: "/blogs" },
  { name: "Contact", href: "/contact" },
  { name: "Dashboard", href: "/dashboard" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-blue-100 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 dark:bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">UK Water Tracker</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live Water Intelligence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle & Emergency Contact & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="hidden md:flex border-gray-200 dark:border-gray-700"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center space-x-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              asChild
            >
              <Link href="/contact">
                <Phone className="h-4 w-4" />
                <span>Emergency: 999</span>
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="flex items-center space-x-3">
                    <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">UK Water Tracker</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Live Water Intelligence</p>
                    </div>
                  </div>

                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="pt-4 border-t dark:border-gray-700">
                    {/* Theme Toggle for Mobile */}
                    {mounted && (
                      <Button variant="outline" className="w-full mb-3" onClick={toggleTheme}>
                        {theme === "dark" ? (
                          <>
                            <Sun className="h-4 w-4 mr-2" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4 mr-2" />
                            Dark Mode
                          </>
                        )}
                      </Button>
                    )}

                    <Button className="w-full mb-3 bg-red-600 hover:bg-red-700" asChild>
                      <Link href="/contact">
                        <Phone className="h-4 w-4 mr-2" />
                        Emergency: 999
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
