// app/api/auth/route.ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { signicatConfig } from "~/config/signicat";
import * as jose from "jose";
import * as client from "openid-client";

async function convertJWKToCryptoKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"],
  );
}

export async function POST(request: NextRequest) {
  try {
    const server = `${signicatConfig.domain}/auth/open`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const config: client.Configuration = await client.discovery(
      new URL(server),
      signicatConfig.clientId,
      signicatConfig.clientSecret,
    );

    /**
     * Value used in the authorization request as the redirect_uri parameter, this
     * is typically pre-registered at the Authorization Server.
     */
    const redirect_uri = signicatConfig.redirectUri;
    const scope = "openid profile"; // Scope of the access request
    /**
     * PKCE: The following MUST be generated for every redirect to the
     * authorization_endpoint. You must store the code_verifier and state in the
     * end-user session such that it can be recovered as the user gets redirected
     * from the authorization server back to your application.
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const code_verifier: string = client.randomPKCECodeVerifier();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const code_challenge: string =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await client.calculatePKCECodeChallenge(code_verifier);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const state: string = client.randomState();

    const requestObjectParameters: Record<string, string> = {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method: "S256",
      state,
      response_type: "code",
      prompt: "login",
      iss: signicatConfig.clientId,
      aud: signicatConfig.issuer,
      iat: Math.floor(Date.now() / 1000).toString(),
      exp: Math.floor(Date.now() / 1000 + 3600).toString(),
    };

    const cryptoKey = await convertJWKToCryptoKey(signicatConfig.privateKeyJWK);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const redirectTo: URL = await client.buildAuthorizationUrlWithJAR(
      config,
      requestObjectParameters,
      cryptoKey,
    );

    console.log("redirectTo", redirectTo.href);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (await cookies()).set("code_verifier", code_verifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (await cookies()).set("auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return NextResponse.json({ url: redirectTo.href });
  } catch (error) {
    console.error("Failed to initialize authentication:", error);
    return NextResponse.json(
      { error: "Failed to initialize authentication" },
      { status: 500 },
    );
  }
}
