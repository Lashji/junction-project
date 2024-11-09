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
  initialized: boolean;
  authType: "did" | "fingerprint" | null;
  fingerprintToken?: string;
  visitorId?: string;
  tokenData?: TokenData;
  userId?: string;
}

interface AuthActions {
  initialize: (tokenData?: TokenData) => Promise<void>;
  initializeWithFingerprint: (authToken: string, visitorId: string) => void;
  logout: () => void;
  setNationality: (nationality: string) => void;
  setInitialized: (initialized: boolean) => void;
  setUserId: (userId?: string) => void;
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
  initialized: false,
  authType: null,
  fingerprintToken: undefined,
  visitorId: undefined,
  userId: undefined,
  // Actions
  actions: {
    initialize: async (tokenData?: TokenData) => {
      set({ isLoading: true });
      try {
        const wallet = new Wallet(tokenData);
        await wallet.isReady();
        console.log("wallet is ready");

        const did = wallet.getActiveIdentityDID();
        console.log("Initializing wallet", did);

        return set({
          wallet,
          did,
          isAuthenticated: true,
          isLoading: false,
          tokenData,
        });
      } catch (err) {
        set({
          error:
            err instanceof Error
              ? err
              : new Error("Failed to initialize wallet"),
          isLoading: false,
        });
        throw new Error(`Failed to initialize wallet: ${err as string}`);
      }
    },
    setUserId: (userId?: string) =>
      userId ? set({ userId }) : set({ userId: undefined }),
    setInitialized: (initialized: boolean) => set({ initialized }),

    logout: () => {
      localStorage.clear();
      set({
        wallet: null,
        did: undefined,
        isAuthenticated: false,
        nationality: "",
        authType: null,
        fingerprintToken: undefined,
        visitorId: undefined,
      });
    },

    setNationality: (nationality: string) => set({ nationality }),

    initializeWithFingerprint: (authToken: string, visitorId: string) => {
      set({
        isAuthenticated: true,
        authType: "fingerprint",
        fingerprintToken: authToken,
        visitorId,
        isLoading: false,
      });
    },
  },
}));
