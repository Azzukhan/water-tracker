import React from "react"

export default function WaterLevelsWidget() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-400">Water Levels</h2>
      <div className="text-gray-500 dark:text-gray-300 text-sm">No water level data available.</div>
    </div>
  )
}