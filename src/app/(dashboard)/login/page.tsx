"use client";

import { KeyIcon } from "lucide-react";
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
    <div className="flex h-screen items-center justify-center">
      <div className="m-16 flex flex-col items-center rounded-lg bg-card-foreground p-4">
        <div className="mt-[-8px]">
          <KeyIcon size={100} />
        </div>
        <p className="mb-2">You need to authenticate yourself to vote.</p>
        <p className="mb-2 pb-6">
          <b>Quorum</b> guarantee you <b>100% anonymity</b> in voting process.
        </p>
        <Button variant="default" onClick={handleLogin}>
          Authenticate with Bank ID
        </Button>
      </div>

      {/* <div className="container mx-auto p-4">
        <div className="content-center">
          <IoMdKey size={70} className="content-center" />
        </div>
        <div className="mb-6 mt-6 rounded-lg bg-card-foreground p-4">
          <h1 className="mb-4 text-2xl font-bold">
            Authenticate yourself to vote
          </h1>
          <p className="mb-2">
            You need to authenticate yourself to vote. Quorum guarantee you 100%
            anonymity in voting process.
          </p>
          
        </div>
      </div> */}
    </div>
  );
}
