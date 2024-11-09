"use client";

import { useStore } from "~/store";
import { useVerifiedAccount } from "../_hooks/useVerifiedAccount";
import VerifiedAccountInitializer from "./verified-account-initializer";
import Account from "./account";

type Props = {
  tempIdToken: string;
};

export default function AccountLoader({ tempIdToken }: Props) {
  const { isLoading, error } = useVerifiedAccount(tempIdToken);
  const { initialized } = useStore();

  return (
    <>
      {isLoading ? (
        <VerifiedAccountInitializer
          isLoading={isLoading}
          error={error}
          initialized={initialized}
        />
      ) : (
        <Account />
      )}
    </>
  );
}
