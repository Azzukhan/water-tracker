import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import Footer from "../components/footer"
import { Toaster } from "@/components/ui/sonner"
import { ColorBlindProvider } from "@/components/color-blind-provider"
import { MainContent } from "@/components/main-content"


export const metadata: Metadata = {
  title: "UK Water Tracker",
  description: "Real-time water level monitoring and weather updates for the UK",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ColorBlindProvider>
          <ThemeProvider>
            <Header />
            <MainContent>{children}</MainContent>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </ColorBlindProvider>
      </body>
    </html>
  )
}
