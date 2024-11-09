"use client";

import { W3CCredential } from "@0xpolygonid/js-sdk";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "~/app/_context/auth-context";
import { useStore } from "~/store";
import { api } from "~/trpc/react";
import { IssuedCredential, type TokenData } from "~/types";

interface Props {
  tempIdToken: string;
}

export default function SetupClient({ tempIdToken }: Props) {
  const { isAuthenticated, actions, did } = useAuth();
  const [credentialData, setCredentialData] = useState<IssuedCredential | null>(
    null,
  );

  const { wallet } = useStore();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  useEffect(() => {
    const handleInitializeUserWallet = async () => {
      if (tempIdToken && !tokenData) {
        const data = JSON.parse(tempIdToken) as unknown as TokenData;
        setTokenData(() => data);

        await actions.initialize(data);
      }
    };

    void handleInitializeUserWallet();
  }, [actions, tempIdToken, tokenData]);

  const {
    data,
    error,
    isLoading: isLoadingCredential,
  } = api.issuer.issueCredential.useQuery(
    {
      did: did!,
      credentialData: {
        name: tokenData?.name ?? "",
        gender: tokenData?.gender ?? "",
        age: tokenData?.birthdate
          ? String(
              new Date().getFullYear() -
                new Date(
                  tokenData.birthdate.split(".").reverse().join("-"),
                ).getFullYear(),
            )
          : "",
        nationality: "FIN",
      },
    },
    {
      enabled: !!did && !!tempIdToken && !!tokenData && !credentialData,
      retry: false,
    },
  );

  useEffect(() => {
    if (data && wallet) {
      setCredentialData(data as IssuedCredential);
      const credential = W3CCredential.fromJSON(data);
      console.log("credential", credential);

      wallet.saveCredential(credential);
    }
  }, [data]);

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return <>{error ? <div>{error.message}</div> : <div>Initialized</div>}</>;
}
