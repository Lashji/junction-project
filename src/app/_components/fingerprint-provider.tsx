"use client";

import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FingerprintContext } from "../_context/fingerprint-context";

interface FingerprintProviderProps {
  children: React.ReactNode;
  tempIdToken?: string;
  tempRawToken?: string;
}

export default function FingerprintProvider({
  children,
  tempIdToken,
  tempRawToken,
}: FingerprintProviderProps) {
  const searchParams = useSearchParams();
  const initialize = searchParams.get("initialize");
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
      if (!visitorData?.visitorId) return;

      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitorId: visitorData.visitorId,
            tempIdToken,
            tempRawToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user ID");
        }

        const data = (await response.json()) as { userId: string };
        setUserId(data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      } finally {
        setIsUserIdLoading(false);
      }
    };

    if (visitorData?.visitorId) {
      void fetchUserId();
    }
  }, [visitorData?.visitorId, tempIdToken, tempRawToken]);

  if (initialize) {
    return <div>Initializing...</div>;
  }

  if (isVisitorLoading || isUserIdLoading) {
    return <div>Loading...</div>;
  }

  if (visitorError) {
    return <div>Error: {visitorError.message}</div>;
  }

  if (!visitorData?.visitorId || !userId) {
    return <div>Authentication failed</div>;
  }

  const contextValue = {
    authToken: userId,
    visitorId: visitorData.visitorId,
  };

  return (
    <FingerprintContext.Provider value={contextValue}>
      {children}
    </FingerprintContext.Provider>
  );
}
