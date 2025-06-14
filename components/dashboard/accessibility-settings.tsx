"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, Type, Keyboard, MousePointer, Check } from "lucide-react"
import { useTheme } from "next-themes"

export function AccessibilitySettings() {
  const { theme, setTheme } = useTheme()
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [keyboardMode, setKeyboardMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load accessibility settings from localStorage on component mount
  useEffect(() => {
    if (mounted) {
      const savedSettings = localStorage.getItem("accessibilitySettings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setHighContrast(settings.highContrast || false)
        setFontSize(settings.fontSize || 100)
        setKeyboardMode(settings.keyboardMode || false)
        setReducedMotion(settings.reducedMotion || false)
      }

      // Apply font size to document root
      document.documentElement.style.fontSize = `${fontSize}%`

      // Apply reduced motion if enabled
      if (reducedMotion) {
        document.documentElement.classList.add("reduce-motion")
      } else {
        document.documentElement.classList.remove("reduce-motion")
      }

      // Apply high contrast if enabled
      if (highContrast) {
        document.documentElement.classList.add("high-contrast")
      } else {
        document.documentElement.classList.remove("high-contrast")
      }

      // Apply keyboard mode if enabled
      if (keyboardMode) {
        document.documentElement.classList.add("keyboard-mode")
      } else {
        document.documentElement.classList.remove("keyboard-mode")
      }
    }
  }, [mounted, fontSize, reducedMotion, highContrast, keyboardMode])

  // Save accessibility settings to localStorage when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        "accessibilitySettings",
        JSON.stringify({
          highContrast,
          fontSize,
          keyboardMode,
          reducedMotion,
        }),
      )
    }
  }, [mounted, highContrast, fontSize, keyboardMode, reducedMotion])

  // Apply font size change
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0])
    document.documentElement.style.fontSize = `${value[0]}%`
  }

  if (!mounted) {
    return null
  }

  return (
    <Card className="shadow-lg border-0 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white">
        <CardTitle className="text-xl font-bold flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Accessibility Settings
        </CardTitle>
        <p className="text-purple-100">Customize your viewing experience</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Theme Selection */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Theme Preference</h3>
          <RadioGroup
            value={theme || "system"}
            onValueChange={(value) => setTheme(value)}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="cursor-pointer">
                Light Mode
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="cursor-pointer">
                Dark Mode
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="cursor-pointer">
                System Default
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* High Contrast */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">High Contrast</h3>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">Increases contrast for better readability</p>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Type className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Font Size: {fontSize}%</h3>
          </div>
          <div className="pl-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Smaller</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Larger</span>
            </div>
            <Slider
              value={[fontSize]}
              min={75}
              max={150}
              step={5}
              onValueChange={handleFontSizeChange}
              className="mb-2"
            />
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => handleFontSizeChange([100])} className="text-xs">
                Reset to Default
              </Button>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Current: {fontSize < 100 ? "Smaller" : fontSize > 100 ? "Larger" : "Default"}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Keyboard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Keyboard Navigation</h3>
            </div>
            <Switch checked={keyboardMode} onCheckedChange={setKeyboardMode} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">Enhanced focus indicators for keyboard users</p>
        </div>

        {/* Reduced Motion */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Reduced Motion</h3>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">Minimizes animations and transitions</p>
        </div>

        {/* Apply Button */}
        <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
          <Check className="h-4 w-4 mr-2" />
          Apply Settings
        </Button>
      </CardContent>
    </Card>
  )
}
