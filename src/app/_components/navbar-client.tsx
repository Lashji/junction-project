"use client";

import { Button } from "~/components/ui/button";
import { useFingerprint } from "../_context/fingerprint-context";
import Link from "next/link";

export default function NavbarClient() {
  const { authToken } = useFingerprint();

  return (
    <div className="flex w-full items-center justify-between px-4 py-3">
      <Button variant="ghost">
        <Link href="/">Quorum</Link>
      </Button>
      <Button variant="ghost">
        <Link href="/login">Login</Link>
      </Button>
    </div>
  );
}
