import { create } from "zustand";
import { Wallet } from "~/lib/wallet";
import { type TokenData } from "~/types";
import { ActiveIdentityManager } from "~/lib/wallet/local-storage-service";

interface AuthState {
  wallet: Wallet | null;
  did: string | undefined;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  nationality: string;
}

interface AuthActions {
  initialize: (tempIdToken: string) => Promise<void>;
  logout: () => void;
  setNationality: (nationality: string) => void;
}

interface StoreState extends AuthState {
  actions: AuthActions;
}

const accountManager = new ActiveIdentityManager();

export const useStore = create<StoreState>((set, get) => ({
  // Auth State
  wallet: null,
  did: undefined,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  nationality: "",

  // Actions
  actions: {
    initialize: async (tempIdToken: string) => {
      set({ isLoading: true });
      try {
        const tokenData = JSON.parse(tempIdToken) as TokenData;
        const wallet = new Wallet(tokenData);
        const did = wallet.getActiveIdentityDID();

        set({
          wallet,
          did,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err) {
        set({
          error:
            err instanceof Error
              ? err
              : new Error("Failed to initialize wallet"),
          isLoading: false,
        });
      }
    },

    logout: () => {
      localStorage.clear();
      set({
        wallet: null,
        did: undefined,
        isAuthenticated: false,
        nationality: "",
      });
    },

    setNationality: (nationality: string) => set({ nationality }),
  },
}));
