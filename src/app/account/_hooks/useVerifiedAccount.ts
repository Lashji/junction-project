import { useEffect, useState } from "react";
import { useStore } from "~/store/index";

export function useVerifiedAccount(tempIdToken?: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { initializeVerifiedAccount } = useStore();

  useEffect(() => {
    async function initialize() {
      if (!tempIdToken) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Initializing verified account", tempIdToken);

        initializeVerifiedAccount(tempIdToken);
        setIsInitialized(true);
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
  }, [tempIdToken, initializeVerifiedAccount]);

  return { isInitialized, isLoading, error };
}
