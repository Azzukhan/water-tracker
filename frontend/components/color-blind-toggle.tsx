"use client"

import { Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useColorBlind } from "@/components/color-blind-provider";

export function ColorBlindToggle({ className }: { className?: string }) {
  const { colorBlind, setColorBlind } = useColorBlind();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Palette className={"h-4 w-4"} aria-hidden="true" />
      <label htmlFor="color-blind-toggle" className="text-sm">
        Color Blind
      </label>
      <Switch
        id="color-blind-toggle"
        checked={colorBlind}
        onCheckedChange={setColorBlind}
        aria-label="Toggle color blind mode"
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
      />
    </div>
  );
}

