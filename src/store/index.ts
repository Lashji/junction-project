import { create } from "zustand";
import { type TokenData } from "~/types";

interface StoreState {
  nationality: string;
  setNationality: (nationality: string) => void;
  initializeVerifiedAccount: (tempIdToken: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  nationality: "",
  setNationality: (nationality) => set({ nationality }),
  initializeVerifiedAccount: (tempIdToken: string) => {
    try {
      const parsedToken = JSON.parse(tempIdToken) as unknown as TokenData;
      set({ nationality: parsedToken.birthdate });
    } catch (error) {
      console.error("Failed to parse tempIdToken:", error);
      set({ nationality: "" });
    }
  },
}));
