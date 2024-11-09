"use client";

import { createContext, useContext, useEffect } from "react";
import { useStore } from "~/store";
import { ActiveIdentityManager } from "~/lib/wallet/local-storage-service";

const AuthContext = createContext<{ initialized: boolean }>({
  initialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, actions } = useStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const accountManager = new ActiveIdentityManager();
      const activeIdentity = accountManager.getActiveIdentity();
      console.log("Authbound provider", accountManager, activeIdentity);

      if (activeIdentity?.did) {
        try {
          await actions.initialize(activeIdentity.did);
        } catch (error) {
          console.error("Failed to initialize auth:", error);
        }
      } else {
        // Set initialized state even when there's no active identity
        actions.setInitialized(true);
      }
    };

    void initializeAuth();
  }, []); // Empty dependency array since we only want this to run once

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