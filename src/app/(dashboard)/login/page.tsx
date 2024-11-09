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
  return <Button onClick={handleLogin}>Login</Button>;
}
