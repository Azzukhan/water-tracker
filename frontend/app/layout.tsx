// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import Footer from "../components/footer"
import { Toaster } from "@/components/ui/sonner"
import { ColorBlindProvider } from "@/components/color-blind-provider"
import { MainContent } from "@/components/main-content"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { A11yProvider } from "@/components/a11y-provider"

export const metadata: Metadata = {
  title: "UK Water Tracker",
  description: "Real-time water level monitoring and weather updates for the UK",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ColorBlindProvider>
          <ThemeProvider>
            <A11yProvider>
              {/* Toolbar stays at VERY top */}
              <AccessibilityToolbar />
              {/* Header sits under toolbar; it’s auto-offset by your CSS rule */}
              <Header />

              {/* ⬇️ APPLY COLOR-BLIND FILTER HERE (not on <body>) */}
              <div id="a11y-filter-root">
                <MainContent>{children}</MainContent>
                <Footer />
              </div>

              <Toaster />
            </A11yProvider>
          </ThemeProvider>
        </ColorBlindProvider>
      </body>
    </html>
  )
}
