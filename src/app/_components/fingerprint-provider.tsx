"use client";

import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FingerprintContext,
  type FingerprintContextType,
} from "../_context/fingerprint-context";
import { env } from "~/env";

interface FingerprintProviderProps {
  children: React.ReactNode;
}

export default function FingerprintProvider({
  children,
}: FingerprintProviderProps) {
  const [isUserIdLoading, setIsUserIdLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchUserId = async () => {
      if (!visitorData?.requestId) return;

      try {
        console.log("Fetching user ID", visitorData.requestId);

        const response = await fetch(
          `${env.NEXT_PUBLIC_BACKEND_URL}/auth/getUserIdWeak?requestId=${visitorData.requestId}`,
        );

        if (!response.ok) {
          console.log("Failed to fetch user ID", response);
          // throw new Error("Failed to fetch user ID");
          setUserId(null);
          return;
        }

        const data = (await response.json()) as { userId: string };
        setUserId(data.userId ?? 0);
      } catch (error) {
        console.error("Error fetching user ID:", error);
        setUserId(null);
      } finally {
        setIsUserIdLoading(false);
      }
    };

    if (visitorData?.visitorId) {
      void fetchUserId();
    }
  }, [visitorData?.visitorId, visitorData?.requestId]);

  if (isVisitorLoading || isUserIdLoading) {
    return <div>Loading...</div>;
  }

  if (visitorError) {
    return <div>Error: {visitorError.message}</div>;
  }

  const contextValue: FingerprintContextType = {
    authToken: userId ?? undefined,
    visitorId: visitorData?.visitorId,
  };

  return (
    <FingerprintContext.Provider value={contextValue}>
      {children}
    </FingerprintContext.Provider>
  );
}
