"use client";

interface VerifiedAccountInitializerProps {
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
}

export default function VerifiedAccountInitializer({
  isLoading,
  error,
  initialized,
}: VerifiedAccountInitializerProps) {
  if (error) {
    return <div>Failed to verify account: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Verifying your account...</div>;
  }

  if (!initialized) {
    return <div>No verification token found</div>;
  }

  return <div>Account verified successfully!</div>;
}
