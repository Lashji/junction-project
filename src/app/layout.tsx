import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Quorum",
  description: "Discover and vote on topics you care about",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
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
            {children}
          </FpjsProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
