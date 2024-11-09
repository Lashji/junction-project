import { cookies } from "next/headers";

import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";
import { env } from "~/env";

import { AuthProvider } from "./_context/auth-context";

export const metadata: Metadata = {
  title: "Quorum",
  description: "Discover and vote on topics you care about",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
            <AuthProvider>{children}</AuthProvider>
          </FpjsProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
