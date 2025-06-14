"use client"
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet"
import type { MapContainerProps, TileLayerProps } from "react-leaflet"
import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"

export default function RainRadarMap() {
  const center: [number, number] = [54.5, -3.5] // UK center
  const zoom = 6
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTime() {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json")
        const data = await res.json()
        const ts = data?.radar?.nowcast?.[0] || data?.radar?.past?.slice(-1)?.[0]
        if (ts) setTimestamp(String(ts))
      } catch {
        setTimestamp(null)
      }
    }
    fetchTime()
    const interval = setInterval(fetchTime, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const tile = timestamp
    ? `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`
    : "https://tilecache.rainviewer.com/v2/radar/nowcast/6/256/{z}/{x}/{y}/2/1_1.png"

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
      className="w-full h-80 rounded-lg"
      as={undefined as unknown as React.ElementType<MapContainerProps>}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & RainViewer'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        as={undefined as unknown as React.ElementType<TileLayerProps>}
      />
      <TileLayer url={tile} opacity={0.7} as={undefined as unknown as React.ElementType<TileLayerProps>} />
      <ZoomControl position="bottomright" />
    </MapContainer>
  )
}
