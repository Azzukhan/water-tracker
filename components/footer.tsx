import React from "react"

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-sky-100 to-blue-100 border-t border-blue-200 py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col gap-2 md:flex-row items-center justify-between text-gray-600 text-sm">
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

