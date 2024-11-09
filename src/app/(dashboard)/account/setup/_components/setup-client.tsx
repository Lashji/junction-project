"use client";

import { useEffect, useState } from "react";
import { useAuth } from "~/app/_context/auth-context";
import { useStore } from "~/store";
import { api } from "~/trpc/react";
import { type TokenData } from "~/types";

interface Props {
  tempIdToken: string;
}

export default function SetupClient({ tempIdToken }: Props) {
  const { isAuthenticated, actions, did } = useAuth();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  useEffect(() => {
    const handleInitializeUserWallet = async () => {
      if (tempIdToken && !tokenData) {
        const data = JSON.parse(tempIdToken) as unknown as TokenData;
        console.log("data", data);
        console.log("tempIdToken", tempIdToken);
        setTokenData(() => data);

        await actions.initialize(data);
      }
    };

    void handleInitializeUserWallet();
  }, [actions, tempIdToken, tokenData]);

  const { data, error } = api.issuer.issueCredential.useQuery(
    {
      did: did!,
      credentialData: {
        name: "Lassi",
        gender: "Male",
        age: 33,
        nationality: "FI",
      },
    },
    {
      enabled: !!did && !!tempIdToken && !!tokenData,
    },
  );

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <>
      <div>{tempIdToken ? JSON.stringify(tempIdToken) : ""}</div>
      {error ? (
        <div>{error.message}</div>
      ) : (
        <div>{data ? JSON.stringify(data) : "No data"}</div>
      )}
    </>
  );
}
