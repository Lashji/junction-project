"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useAuth } from "../_context/auth-context";

export default function NavbarClient() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-semibold">
          Home
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link href="/account">
              <Button variant="ghost">Account</Button>
            </Link>
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
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </>
  );
}
