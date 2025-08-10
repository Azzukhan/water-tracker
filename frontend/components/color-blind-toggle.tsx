"use client"

import { Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useColorBlind } from "@/components/color-blind-provider";

export function ColorBlindToggle({ className }: { className?: string }) {
  const { isColorBlind, toggleColorBlind } = useColorBlind();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Palette className="h-4 w-4" aria-hidden="true" />
      <label htmlFor="color-blind-toggle" className="text-sm">
        Color-Blind Mode
      </label>
      <Switch
        id="color-blind-toggle"
        checked={isColorBlind}
        onCheckedChange={toggleColorBlind}
        aria-label="Toggle color-blind mode"
        aria-checked={isColorBlind}
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
      />
    </div>
  );
}

