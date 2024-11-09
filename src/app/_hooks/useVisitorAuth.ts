import {
  useVisitorData,
  type VisitorData,
} from "@fingerprintjs/fingerprintjs-pro-react";
import { useQuery } from "@tanstack/react-query";
import { env } from "~/env";

interface UseVisitorAuthResult {
  isLoading: boolean;
  error: Error | null;
  visitorData: VisitorData | undefined;
  authToken: string | null;
  userId: string | null;
  isUserIdLoading: boolean;
}

export function useVisitorAuth(): UseVisitorAuthResult {
  const {
    isLoading: isVisitorLoading,
    error: visitorError,
    data: visitorData,
  } = useVisitorData({ extendedResult: true }, { immediate: true });

  console.log(`visitorData`, visitorData);

  // You can add additional authentication logic here if needed
  // For now, we'll just use the visitorId as the auth token
  const authToken = visitorData?.visitorId ?? null;

  const fetchUserId = async () => {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/auth/getUserIdWeak?requestId=${authToken}`,
      {
        method: "GET",
      },
    );
    const data = (await response.json()) as { userId: string };
    return data.userId;
  };

  const { data: userId, isLoading: isUserIdLoading } = useQuery({
    queryKey: ["userId"],
    queryFn: fetchUserId,
  });

  return {
    isLoading: isVisitorLoading ?? false,
    error: visitorError ?? null,
    visitorData,
    authToken,
    userId: userId ?? null,
    isUserIdLoading,
  };
}
