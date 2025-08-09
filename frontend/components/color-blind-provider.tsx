"use client"

import React, { createContext, useContext, useEffect, useState } from "react";

interface ColorBlindContextValue {
  colorBlind: boolean;
  setColorBlind: (value: boolean) => void;
}

const ColorBlindContext = createContext<ColorBlindContextValue | undefined>(
  undefined
);

export function ColorBlindProvider({ children }: { children: React.ReactNode }) {
  const [colorBlind, setColorBlind] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("colorBlind");
    if (stored) {
      setColorBlind(stored === "true");
    }
  }, []);

  // Persist and update html class
  useEffect(() => {
    const root = document.documentElement;
    if (colorBlind) {
      root.classList.add("color-blind");
    } else {
      root.classList.remove("color-blind");
    }
    localStorage.setItem("colorBlind", colorBlind ? "true" : "false");
  }, [colorBlind]);

  return (
    <ColorBlindContext.Provider value={{ colorBlind, setColorBlind }}>
      {children}
    </ColorBlindContext.Provider>
  );
}

export function useColorBlind() {
  const context = useContext(ColorBlindContext);
  if (!context) {
    throw new Error("useColorBlind must be used within a ColorBlindProvider");
  }
  return context;
}

