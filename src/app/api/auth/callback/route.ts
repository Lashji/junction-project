// app/api/auth/callback/route.ts
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { signicatConfig } from "~/config/signicat";
import { env } from "~/env";
import * as jose from "jose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const server = `${signicatConfig.domain}/auth/open`;
    const wellKnown = await fetch(
      `${server}/.well-known/openid-configuration`,
    ).then((res) => res.json() as unknown);

    const code = new URL(request.url).searchParams.get("code");
    const code_verifier = (await cookies()).get("code_verifier")?.value;
    const state = (await cookies()).get("auth_state")?.value;

    if (!code || !code_verifier || !state) {
      return NextResponse.redirect(
        new URL(
          "/sign-in?error=true&error_description=Missing required parameters",
          env.NEXT_PUBLIC_BASE_URL,
        ),
      );
    }

    // Prepare token request parameters
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: signicatConfig.redirectUri,
      client_id: signicatConfig.clientId,
      code_verifier,
    });

    // Make token request
    const tokenResponse = await fetch(
      (wellKnown as { token_endpoint: string }).token_endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${signicatConfig.clientId}:${signicatConfig.clientSecret}`,
          ).toString("base64")}`,
        },
        body: params,
      },
    );

    const tokens = (await tokenResponse.json()) as {
      id_token: string;
    };
    console.log("Raw token response:", tokens);

    // If we get an encrypted response, decrypt it
    if (tokens.id_token) {
      const privateKey = await jose.importJWK(
        signicatConfig.encryptionPrivateKey,
        "RSA-OAEP-256",
      );

      const decrypted = await jose.compactDecrypt(tokens.id_token, privateKey);
      const jwtToken = new TextDecoder().decode(decrypted.plaintext);

      // Decode the JWT token
      const decodedToken = jose.decodeJwt(jwtToken);

      // Store the decoded token data
      (await cookies()).set("temp_id_token", JSON.stringify(decodedToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300, // 5 minutes to complete setup
      });

      // Store the raw JWT for verification purposes if needed
      (await cookies()).set("temp_raw_token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300,
      });
    }

    // Clear the auth cookies
    (await cookies()).delete("code_verifier");
    (await cookies()).delete("auth_state");

    return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_BASE_URL));
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=true&error_description=${error as string}`,
        env.NEXT_PUBLIC_BASE_URL,
      ),
    );
  }
}
