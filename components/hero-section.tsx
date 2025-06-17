"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [scotlandLevel, setScotlandLevel] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/water-levels/scottish-averages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setScotlandLevel(data[0].current)
        }
      })
      .catch(() => setScotlandLevel(null))
  }, [])
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-cyan-900 dark:from-blue-900 dark:via-cyan-900 dark:to-blue-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fillOpacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                <Zap className="h-4 w-4 mr-2 text-yellow-300" />
                Live Data • Real-time Updates
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Track UK's Water:
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  Live, Historic & Future
                </span>
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                Monitor water levels, weather patterns, and quality across the UK with real-time data from trusted
                agencies.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 text-lg group"
                asChild
              >
                <Link href="https://ukwatertracker.co.uk/water-levels">
                  Explore Water Levels
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
                asChild
              >
                <Link href="https://ukwatertracker.co.uk/weather">View Weather Report</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">500+</div>
                <div className="text-sm text-blue-200">Monitoring Stations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">24/7</div>
                <div className="text-sm text-blue-200">Live Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">99.9%</div>
                <div className="text-sm text-blue-200">Uptime</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Live Status</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm">Online</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
                      Scottish Water Level
                    </span>
                    <span className="font-mono text-lg font-semibold">
                      {scotlandLevel !== null ? `${scotlandLevel}%` : "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white">
                    <span className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-400" />
                      Water Quality
                    </span>
                    <span className="text-green-400 font-semibold">Excellent</span>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-white text-sm mb-2">Today's Trend</div>
                    <div className="h-16 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded flex items-end justify-between px-2">
                      {[40, 65, 45, 80, 60, 75, 90].map((height, i) => (
                        <div key={i} className="bg-cyan-400 rounded-t w-3" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
