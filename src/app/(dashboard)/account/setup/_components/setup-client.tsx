"use client";

import { W3CCredential } from "@0xpolygonid/js-sdk";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/app/_context/auth-context";
import { env } from "~/env";
import { useStore } from "~/store";
import { api } from "~/trpc/react";
import { IssuedCredential, type TokenData } from "~/types";

interface Props {
  tempIdToken: string;
}

const markUserVerified = async (userId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/auth/markUserStrong?userId=${userId}`,
  );
  console.log("marking user verified response", response);

  const data = (await response.json()) as { success: boolean };
  console.log("marking user verified data", data);
  return data;
};

export default function SetupClient({ tempIdToken }: Props) {
  const { isAuthenticated, verified, actions, did, userId } = useAuth();
  const [credentialData, setCredentialData] = useState<IssuedCredential | null>(
    null,
  );

  const { wallet } = useStore();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const { mutate: markUserVerifiedMutation } = useMutation({
    mutationKey: ["markUserVerified"],
    mutationFn: (userId: string) => markUserVerified(userId),
  });

  useEffect(() => {
    const handleInitializeUserWallet = async () => {
      if (tempIdToken && !tokenData) {
        const data = JSON.parse(tempIdToken) as unknown as TokenData;
        setTokenData(() => data);

        await actions.initialize(data);
      }
    };

    if (userId && !verified) {
      actions.setVerified(true);
      console.log("marking user verified", userId);

      markUserVerifiedMutation(userId);
    }

    void handleInitializeUserWallet();
  }, [
    actions,
    markUserVerifiedMutation,
    tempIdToken,
    tokenData,
    userId,
    verified,
  ]);

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

  const router = useRouter();

  useEffect(() => {
    if (data && wallet) {
      const vc = (data as unknown as IssuedCredential).vc;

      const credential = W3CCredential.fromJSON(vc);
      console.log("credential", credential);

      void wallet.saveCredential(credential);

      router.push("/account");
    }
  }, [data]);

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <>
      {error ? (
        <div>{error.message}</div>
      ) : isLoadingCredential ? (
        <div>Loading...</div>
      ) : (
        <div>Initialized</div>
      )}
    </>
  );
}
