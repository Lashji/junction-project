import { useEffect, useState } from "react";
import { useStore } from "~/store/index";

export function useVerifiedAccount(tempIdToken?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { initializeVerifiedAccount, setInitialized } = useStore();

  useEffect(() => {
    async function initialize() {
      if (!tempIdToken) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Initializing verified account", tempIdToken);

        initializeVerifiedAccount(tempIdToken);
        setInitialized(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to initialize account"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    void initialize();
  }, [tempIdToken, initializeVerifiedAccount, setInitialized]);

  return { isLoading, error };
}
