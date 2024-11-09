import { cookies } from "next/headers";
import { AccountHeader } from "./_components/account-header";
import { AccountSidebar } from "./_components/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AccountHeader />
      <div className="flex flex-1">
        <div className="hidden border-r bg-gray-100/40 md:block md:w-72">
          <AccountSidebar />
        </div>
        <main className="flex-1">
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
