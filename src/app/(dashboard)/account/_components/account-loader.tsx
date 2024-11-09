"use client";

import Account from "./account";
import { useAuth } from "~/app/_context/auth-context";

export default function AccountLoader() {
  const { isAuthenticated } = useAuth();

  return <Account />;
}
