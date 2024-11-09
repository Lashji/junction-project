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
    const accountManager = new ActiveIdentityManager();
    const activeIdentity = accountManager.getActiveIdentity();
    console.log("Authbound provider", accountManager, activeIdentity);

    if (activeIdentity?.did) {
      // Re-initialize from stored identity
      // You may want to add additional logic here to validate the stored identity
      void actions.initialize(activeIdentity.did);
    }
  }, [actions]);

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
