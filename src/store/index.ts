import { parse } from "path";
import { create } from "zustand";
import { Wallet } from "~/lib/wallet";
import { type TokenData } from "~/types";

interface StoreState {
  nationality: string;
  setNationality: (nationality: string) => void;
  initializeVerifiedAccount: (tempIdToken: string) => void;
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
  wallet: Wallet | null;
  setWallet: (wallet: Wallet) => void;
  getIdentityDID: () => string | undefined;
}

export const useStore = create<StoreState>((set, get) => ({
  nationality: "",
  setNationality: (nationality) => set({ nationality }),
  initializeVerifiedAccount: (tempIdToken: string) => {
    console.log("Initializing verified account", tempIdToken);

    try {
      const tokenData = JSON.parse(tempIdToken) as unknown as TokenData;
      // set({ nationality: parsedToken.birthdate });
      const wallet = new Wallet(tokenData);
      set({ wallet });
      console.log("Wallet initialized", wallet);
    } catch (error) {
      console.error("Failed to parse tempIdToken:", error);
      set({ nationality: "" });
    }
  },
  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
  getIdentityDID: () => {
    const wallet = get().wallet;

    if (!wallet) {
      return;
    }

    return wallet.getActiveIdentityDID();
  },
}));
