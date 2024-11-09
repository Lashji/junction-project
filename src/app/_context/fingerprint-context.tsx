"use client";

import { createContext, useContext } from "react";

interface FingerprintContextType {
  authToken: string;
  visitorId: string;
}

const FingerprintContext = createContext<FingerprintContextType | undefined>(
  undefined,
);

export function useFingerprint() {
  const context = useContext(FingerprintContext);
  if (!context) {
    throw new Error("useFingerprint must be used within a FingerprintProvider");
  }
  return context;
}

export { FingerprintContext };
