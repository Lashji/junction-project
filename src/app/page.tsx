import { cookies } from "next/headers";
import HomeClient from "./_components/home-client";
import FingerprintProvider from "./_components/fingerprint-provider";
import Navbar from "./_components/navbar";

export default async function Page() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value ?? undefined;

  return (
    <FingerprintProvider tempIdToken={tempIdToken}>
      <Navbar />
      <HomeClient />
    </FingerprintProvider>
  );
}
