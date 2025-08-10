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
    const stored = localStorage.getItem("colorBlindMode");
    if (stored) {
      setColorBlind(stored === "true");
    }
  }, []);

  // Persist and update body attribute
  useEffect(() => {
    const body = document.body;
    if (colorBlind) {
      body.setAttribute("data-cb", "1");
    } else {
      body.removeAttribute("data-cb");
    }
    localStorage.setItem("colorBlindMode", colorBlind ? "true" : "false");
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

