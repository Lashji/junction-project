"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useAuth } from "../_context/auth-context";
import { BadgeCheck } from "lucide-react";

export default function NavbarClient() {
  const { isAuthenticated, logout, userId, verified } = useAuth();

  return (
    <>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-2xl font-bold tracking-[3px]">
          Quorum
        </Link>
      </div>

      <div className="flex items-center gap-1">
        {isAuthenticated ? (
          <>
            Welcome, <BadgeCheck className="h-4 w-4" />
            <span className="font-bold">{userId ?? "Anonymous"}</span>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-red-600 hover:bg-red-100 hover:text-red-600"
            >
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button className="bg-foreground">Verify</Button>
          </Link>
        )}
      </div>
    </>
  );
}
