import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTrendMeta(
  current: number,
  change: number,
  days = 7
) {
  const slope = change / (days - 1)
  const angle = Math.atan(slope) * (180 / Math.PI)
  let direction: "rising" | "falling" | "stable" = "stable"
  if (slope > 0.2) direction = "rising"
  else if (slope < -0.2) direction = "falling"

  return { slope, angle, direction }
}
