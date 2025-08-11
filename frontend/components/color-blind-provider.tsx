"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type CbCtx = { isCb: boolean; setCb: (v: boolean) => void; toggleCb: () => void };
const ColorBlindContext = createContext<CbCtx | null>(null);

export const ColorBlindProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isCb, setIsCb] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cb");
      if (saved === "1") setIsCb(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (isCb) root.classList.add("cb");
      else root.classList.remove("cb");
      try {
        localStorage.setItem("cb", isCb ? "1" : "0");
      } catch {}
    }
  }, [isCb]);

  const toggleCb = () => setIsCb((p) => !p);

  return (
    <ColorBlindContext.Provider value={{ isCb, setCb: setIsCb, toggleCb }}>
      {children}
    </ColorBlindContext.Provider>
  );
};

export const useColorBlind = () => {
  const ctx = useContext(ColorBlindContext);
  if (!ctx) throw new Error("useColorBlind must be used within ColorBlindProvider");
  return ctx;
};
