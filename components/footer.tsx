import React from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Droplets } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-sky-100 to-blue-100 border-t border-blue-200 mt-12 text-gray-600 text-sm">
      <div className="container mx-auto px-4 py-16 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 dark:bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">UK Water Tracker</h3>
          </div>
          <p className="mb-4 text-gray-700">Providing real-time water level monitoring and weather updates for the United Kingdom.</p>
          <ul className="space-y-1">
            <li className="flex items-center"><Mail className="h-4 w-4 mr-2 text-blue-600" />info@ukwatertracker.co.uk</li>
            <li className="flex items-center"><Phone className="h-4 w-4 mr-2 text-blue-600" />+44 20 7946 0958</li>
            <li className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-blue-600" />London, United Kingdom</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Services</h4>
          <ul className="space-y-1">
            <li><Link href="/water-levels" className="hover:text-blue-600">Water Level Monitoring</Link></li>
            <li><Link href="/weather" className="hover:text-blue-600">Weather Forecasts</Link></li>
            <li><Link href="/flood-alerts" className="hover:text-blue-600">Flood Alerts</Link></li>
            <li><Link href="/dashboard" className="hover:text-blue-600">Analytics Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Resources</h4>
          <ul className="space-y-1">
            <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">Contact Support</Link></li>
            <li><Link href="/api" className="hover:text-blue-600">API Documentation</Link></li>
            <li><Link href="/data-sources" className="hover:text-blue-600">Data Sources</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-blue-600">Cookie Policy</Link></li>
            <li><Link href="/data-protection" className="hover:text-blue-600">Data Protection</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 border-t border-blue-200 py-8 flex flex-col gap-2 md:flex-row items-center justify-between">
        <div className="text-center md:text-left">
          © {new Date().getFullYear()} UK Water Tracker. Built with Next.js and Django using data from official UK agencies.
        </div>
        <div className="mt-2 md:mt-0 text-center md:text-right">
          Built by <a href="https://github.com/Azzukhan" className="text-blue-600 hover:underline">Azzukhan</a>.{' '}
          <a href="https://github.com/Azzukhan/uk-water-tracker" className="text-blue-600 hover:underline">View source on GitHub</a>
        </div>
      </div>
    </footer>
  )
}

