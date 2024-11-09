"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface VerifiedAccountInitializerProps {
  isLoading: boolean;
  error: Error | null;
}

export default function VerifiedAccountInitializer({
  isLoading,
  error,
}: VerifiedAccountInitializerProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to verify account: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="flex items-center justify-center p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying your account...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Account verified successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
