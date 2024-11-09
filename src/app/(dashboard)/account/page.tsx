import { cookies } from "next/headers";
import AccountLoader from "./_components/account-loader";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value;

  return <AccountLoader />;
}
