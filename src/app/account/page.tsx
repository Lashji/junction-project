import { cookies } from "next/headers";
import { Suspense } from "react";
import VerifiedAccountInitializer from "./_components/verified-account-initializer";

async function CookieHandler() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value;

  return <VerifiedAccountInitializer tempIdToken={tempIdToken} />;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Initializing...</div>}>
      <CookieHandler />
    </Suspense>
  );
}
