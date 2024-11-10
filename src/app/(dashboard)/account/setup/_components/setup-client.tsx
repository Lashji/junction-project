"use client";

import { W3CCredential } from "@0xpolygonid/js-sdk";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "~/app/_context/auth-context";
import { env } from "~/env";
import { useStore } from "~/store";
import { api } from "~/trpc/react";
import { IssuedCredential, type TokenData } from "~/types";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";

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
    }
  }, [data]);

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-16 py-20">
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-500"
        >
          <p className="mb-4 font-medium">Initialization failed</p>
          <p className="text-sm">{error.message}</p>
        </motion.div>
      ) : isLoadingCredential ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center font-medium text-gray-700"
          >
            Initializing your account identity...
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500"
          >
            This may take a few moments
          </motion.p>
        </motion.div>
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <motion.div
            className="flex flex-col items-center space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </motion.div>
            <motion.h3
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-xl font-medium text-gray-900"
            >
              Account Successfully Initialized
            </motion.h3>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-center text-sm text-gray-500"
            >
              Your identity and credentials have been set up
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => router.push("/")}
              className="bg-amber-500 px-8 py-2 font-medium text-white hover:bg-amber-600"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-4"
        >
          <p className="text-center font-medium text-gray-700">
            Ready to initialize
          </p>
        </motion.div>
      )}
    </div>
  );
}
