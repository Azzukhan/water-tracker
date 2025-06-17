"use client"

import { HeroSection } from "@/components/hero-section"
import WeatherWidget from "@/components/weather-widget"
import { QuickInfoTiles } from "@/components/quick-info-tiles"
import { LiveHighlights } from "@/components/live-highlights"

export default function HomePage() {

  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
        <QuickInfoTiles />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2 h-full">
            <LiveHighlights />
          </div>
          <div className="h-full">
            <WeatherWidget />
          </div>
        </div>

      </div>
    </div>
  )
}
