"use client";

import { useVerifiedAccount } from "../_hooks/useVerifiedAccount";

interface VerifiedAccountInitializerProps {
  tempIdToken?: string;
}

export default function VerifiedAccountInitializer({
  tempIdToken,
}: VerifiedAccountInitializerProps) {
  const { isInitialized, isLoading, error } = useVerifiedAccount(tempIdToken);

  if (error) {
    return <div>Failed to verify account: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Verifying your account...</div>;
  }

  if (isInitialized) {
    return <div>Account verified successfully!</div>;
  }

  return <div>No verification token found</div>;
}
