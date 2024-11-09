"use client";

import { createContext, useContext, useEffect } from "react";
import { useStore } from "~/store";
import { ActiveIdentityManager } from "~/lib/wallet/local-storage-service";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { env } from "~/env";
import { useQuery } from "@tanstack/react-query";

const AuthContext = createContext<{ initialized: boolean }>({
  initialized: false,
});

const fetchUserId = async (requestId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/auth/getUserIdWeak?requestId=${requestId}`,
  );
  const userId = (await response.json()) as string;
  return userId;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, actions, isAuthenticated, userId } = useStore();
  const {
    isLoading: isVisitorLoading,
    error: visitorError,
    data: visitorData,
  } = useVisitorData(
    { extendedResult: true },
    {
      immediate: true,
    },
  );

  const { data: newUserId } = useQuery({
    queryKey: ["userId"],
    queryFn: () => fetchUserId(visitorData!.requestId),
    enabled: !!visitorData?.requestId,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      if (isVisitorLoading) return;
      if (isAuthenticated || !userId) return;
      if (visitorError) return;
      if (!newUserId) return;

      const accountManager = new ActiveIdentityManager();
      const activeIdentity = accountManager.getActiveIdentity();
      console.log("initialize auth called", activeIdentity);

      if (activeIdentity?.did) {
        try {
          console.log("initializing with did", activeIdentity.did);
          await actions.initialize();
          console.log("initialization completed");
          actions.setInitialized(true);
        } catch (error) {
          console.error("Failed to initialize DID auth:", error);
          // Fallback to fingerprint auth if DID fails
        }
      }
    };

    void initializeAuth();
  }, [
    actions,
    isAuthenticated,
    userId,
    visitorData?.requestId,
    isVisitorLoading,
    visitorError,
    newUserId,
  ]);

  useEffect(() => {
    if (newUserId || !userId) {
      console.log("setting userId", newUserId);

      actions.setUserId(newUserId);
    }
  }, [actions, newUserId, userId]);

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
