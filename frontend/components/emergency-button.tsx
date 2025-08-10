"use client"

import { useCallback } from "react"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmergencyButtonProps {
  fullWidth?: boolean
  className?: string
}

export function EmergencyButton({ fullWidth = false, className = "" }: EmergencyButtonProps) {
  const handleEmergencyClick = useCallback(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = "tel:999"
      return
    }
    if (window.confirm("Are you sure you want to call emergency services?")) {
      window.location.href = "tel:999"
    }
  }, [])

  return (
    <Button
      onClick={handleEmergencyClick}
        className={`flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 cb:bg-cbVermillion/20 cb:text-cbVermillion font-bold rounded shadow hover:bg-red-100 cb:hover:bg-cbVermillion/30 transition ${fullWidth ? "w-full" : ""} ${className}`}
      aria-label="Call Emergency Services, 999"
    >
      <Phone className="h-4 w-4" />
      <span>Emergency: 999</span>
    </Button>
  )
}
