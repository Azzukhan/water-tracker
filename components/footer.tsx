import React from "react"

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-sky-100 to-blue-100 border-t border-blue-200 py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm">
        <div>
          © {new Date().getFullYear()} UK Weather Tracker. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0">
          Built by <a href="https://github.com/azzu" className="text-blue-600 hover:underline">azzu</a>
        </div>
      </div>
    </footer>
  )
} 