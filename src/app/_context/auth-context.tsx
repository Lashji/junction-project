"use client";

import { createContext, useContext, useEffect } from "react";
import { useStore } from "~/store";
import { ActiveIdentityManager } from "~/lib/wallet/local-storage-service";
import { useFingerprint } from "./fingerprint-context";
import { TokenData } from "~/types";

const AuthContext = createContext<{ initialized: boolean }>({
  initialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, actions } = useStore();
  const { authToken, visitorId } = useFingerprint();

  useEffect(() => {
    const initializeAuth = async () => {
      const accountManager = new ActiveIdentityManager();
      const activeIdentity = accountManager.getActiveIdentity();
      console.log("initialize auth called", activeIdentity);

      if (activeIdentity?.did) {
        try {
          console.log("initializing with did", activeIdentity.did);

          await actions.initialize();
          console.log("initialization completed");
        } catch (error) {
          console.error("Failed to initialize DID auth:", error);
          // Fallback to fingerprint auth if DID fails
          if (authToken && visitorId) {
            actions.initializeWithFingerprint(authToken, visitorId);
          }
        }
      } else if (authToken && visitorId) {
        console.log("auth token and visitor id found");

        // Use fingerprint auth if no DID exists
        actions.initializeWithFingerprint(authToken, visitorId);
      }

      actions.setInitialized(true);
    };

    void initializeAuth();
  }, [actions, authToken, visitorId]);

  return (
    <AuthContext.Provider value={{ initialized: !isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  const store = useStore();

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    ...context,
    ...store,
    ...store.actions,
  };
}
