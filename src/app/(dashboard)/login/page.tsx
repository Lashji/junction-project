import { KeyIcon } from "lucide-react";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import LoginClient from "./_components/login-client";
import { cookies } from "next/headers";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient tempIdToken={tempIdToken} />
    </Suspense>
  );
}
