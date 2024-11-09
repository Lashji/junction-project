"use client";

import { Button } from "~/components/ui/button";

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
      });
      const { url } = (await response.json()) as { url: string };
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to initialize authentication:", error);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <div className="p-4 mt-6 mb-6 bg-gray-100 rounded-lg">
        <h1 className="mb-4 text-2xl font-bold">
          Authenticate yourself to vote
        </h1>
        <p className="mb-2">
          You need to authenticate yourself to vote. Quorum guarantee you 100%
          anonymity in voting process.
        </p>
        <Button onClick={handleLogin}>Authenticate</Button>
      </div>
    </div>
  );
}
