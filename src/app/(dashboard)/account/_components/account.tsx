"use client";

import { useAuth } from "~/app/_context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useStore } from "~/store";

export default function Account() {
  const { isAuthenticated, wallet, did, nationality } = useAuth();

  const { mutateAsync: verifyCredential } = api.verifier.verify.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVerify = async () => {
    const res = (await verifyCredential()) as {
      qrCode: string;
      sessionID: string;
    };

    const split = res.qrCode.split("://?request_uri=");
    console.log("split", split);
    const callbackUrl = split[1]!;

    const callbackResp = await fetch(callbackUrl);
    const callbackRespData = await callbackResp.arrayBuffer();

    console.log("callbackRespData", callbackRespData);

    const proof = await wallet?.createProof(new Uint8Array(callbackRespData));

    console.log("proof", proof);
  };

  if (!wallet) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No wallet found. Please connect your wallet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nationality
                </label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="text-sm">
                    {nationality || "Not specified"}
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Identity DID
                </label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="break-all text-sm">
                    {did ?? "Not specified"}
                  </div>
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => handleVerify()}>Verify</Button>
      </div>
    </div>
  );
}
