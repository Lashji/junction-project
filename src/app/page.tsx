"use client";

import Polls from "./_components/polls";
import { useVisitorAuth } from "./_hooks/useVisitorAuth";

export default function Page() {
  const { isLoading, error, authToken } = useVisitorAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!authToken) {
    return <div>Authentication failed</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <Polls />
    </main>
  );
}
