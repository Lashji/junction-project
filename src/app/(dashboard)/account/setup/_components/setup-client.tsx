"use client";

import { useAuth } from "~/app/_context/auth-context";
import { useStore } from "~/store";

interface Props {
  tempIdToken: string;
}

const createCredentialIssuance = async (did: string) => {
  return fetch("/api/credential-issuance", {
    method: "POST",
    body: JSON.stringify({ did }),
  });
};

export default function SetupClient({ tempIdToken }: Props) {
  const { isAuthenticated } = useAuth();

  const { tokenData } = useStore();
  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return <div>{tempIdToken ? JSON.stringify(tempIdToken) : ""}</div>;
}
