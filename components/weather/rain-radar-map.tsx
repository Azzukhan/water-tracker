"use client"
import { MapContainer, TileLayer } from "react-leaflet"
import type { MapContainerProps, TileLayerProps } from "react-leaflet"
import "leaflet/dist/leaflet.css"

export default function RainRadarMap() {
  const center: [number, number] = [54.5, -3.5] // UK center
  const zoom = 6
  const rainViewerUrl = "https://tilecache.rainviewer.com/v2/radar/nowcast/6/256/{z}/{x}/{y}/2/1_1.png"
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} className="w-full h-72 rounded-lg" as={undefined as unknown as React.ElementType<MapContainerProps>}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & RainViewer'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        as={undefined as unknown as React.ElementType<TileLayerProps>}
      />
      <TileLayer
        url={rainViewerUrl}
        opacity={0.7}
        as={undefined as unknown as React.ElementType<TileLayerProps>}
      />
    </MapContainer>
  )
} 