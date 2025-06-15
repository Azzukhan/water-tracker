"use client"
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet"
import type { MapContainerProps, TileLayerProps } from "react-leaflet"
import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"

export default function RainRadarMap() {
  const center: [number, number] = [54.5, -3.5] // UK center
  const zoom = 6
  const [frames, setFrames] = useState<string[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    async function fetchFrames() {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json")
        const data = await res.json()
        const host: string = data.host
        const past = data?.radar?.past || []
        const nowcast = data?.radar?.nowcast || []
        const all = [...past, ...nowcast]
        const urls = all.map((f: any) => `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`)
        setFrames(urls)
        setIndex(all.length - 1)
      } catch {
        setFrames([])
      }
    }
    fetchFrames()
    const interval = setInterval(fetchFrames, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (frames.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length)
    }, 500)
    return () => clearInterval(id)
  }, [frames])

  const tile = frames[index]

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
      {tile && (
        <TileLayer
          url={tile}
          opacity={0.7}
          as={undefined as unknown as React.ElementType<TileLayerProps>}
        />
      )}
      <ZoomControl position="bottomright" />
    </MapContainer>
  )
}
