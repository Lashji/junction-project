import { cookies } from "next/headers";
import AccountLoader from "./_components/account-loader";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value;

  if (!tempIdToken) {
    return <div>No verification token found</div>;
  }

  return <AccountLoader tempIdToken={tempIdToken} />;
}
