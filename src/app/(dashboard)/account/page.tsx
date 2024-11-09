import { cookies } from "next/headers";
import AccountLoader from "./_components/account-loader";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value;

  return !tempIdToken ? (
    <div className="text-center text-muted-foreground">
      No verification token found
    </div>
  ) : (
    <AccountLoader tempIdToken={tempIdToken} />
  );
}
