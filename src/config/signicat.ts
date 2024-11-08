import { env } from "~/env";

export interface SignicatJWK {
  kty: string;
  n: string;
  alg: string;
  e: string;
  d?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
  kid?: string;
  use?: string;
}

// config/signicat.ts
interface SignicatConfig {
  clientId: string;
  clientSecret: string;
  domain: string;

  publicKey: string;
  privateKeyJWK: SignicatJWK;
  redirectUri: string;
  issuer: string;
  encryptionPrivateKey: SignicatJWK;
}

const parsePrivateKey = (keyString: string): SignicatJWK => {
  try {
    return JSON.parse(keyString) as SignicatJWK;
  } catch (error) {
    console.error("Failed to parse private key:", error);
    console.log("Key string:", keyString); // For debugging
    throw new Error("Invalid private key format");
  }
};

export const signicatConfig: SignicatConfig = {
  clientId: env.SIGNICAT_CLIENT_ID,
  clientSecret: env.SIGNICAT_SECRET,
  domain: env.SIGNICAT_DOMAIN,

  publicKey: env.SIGNICAT_PUBLIC_ENCRYPTION_KEY,
  encryptionPrivateKey: parsePrivateKey(env.SIGNICAT_PRIVATE_ENCRYPTION_KEY),
  privateKeyJWK: parsePrivateKey(env.SIGNICAT_PRIVATE_ENCRYPTION_KEY),
  redirectUri: env.SIGNICAT_REDIRECT_URI,
  issuer: "https://authbound-oy.sandbox.signicat.com/auth/open",
};
