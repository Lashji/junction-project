import { cookies } from "next/headers";
import SetupClient from "./_components/setup-client";

export default async function SetupPage() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value;

  if (!tempIdToken) {
    return <div>Failed to get data</div>;
  }

  return <SetupClient tempIdToken={tempIdToken} />;
}
