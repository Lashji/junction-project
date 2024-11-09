import { cookies } from "next/headers";

import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";
import { env } from "~/env";

import FingerprintProvider from "./_components/fingerprint-provider";
import Navbar from "./_components/navbar";

export const metadata: Metadata = {
  title: "Quorum",
  description: "Discover and vote on topics you care about",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const tempIdToken = cookieStore.get("temp_id_token")?.value ?? undefined;
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <FpjsProvider
            loadOptions={{
              apiKey: env.NEXT_PUBLIC_FINGERPRINTJS_TOKEN,
              region: "eu",
            }}
          >
            <FingerprintProvider tempIdToken={tempIdToken}>
              {children}
            </FingerprintProvider>
          </FpjsProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
