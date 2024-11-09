import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SIGNICAT_CLIENT_ID: z.string(),
    SIGNICAT_SECRET: z.string(),
    SIGNICAT_REDIRECT_URI: z.string().url(),
    SIGNICAT_PUBLIC_SIGNING_KEY: z.string(),
    SIGNICAT_PRIVATE_ENCRYPTION_KEY: z.string(),
    SIGNICAT_PRIVATE_SIGNING_KEY: z.string(),
    SIGNICAT_DOMAIN: z.string(),
    SIGNICAT_ISSUER: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_FINGERPRINTJS_TOKEN: z.string(),
    NEXT_PUBLIC_POLYGON_ID_RPC_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SIGNICAT_CLIENT_ID: process.env.SIGNICAT_CLIENT_ID,
    SIGNICAT_SECRET: process.env.SIGNICAT_SECRET,
    SIGNICAT_REDIRECT_URI: process.env.SIGNICAT_REDIRECT_URI,
    SIGNICAT_PUBLIC_SIGNING_KEY: process.env.SIGNICAT_PUBLIC_SIGNING_KEY,
    SIGNICAT_PRIVATE_ENCRYPTION_KEY:
      process.env.SIGNICAT_PRIVATE_ENCRYPTION_KEY,
    SIGNICAT_PRIVATE_SIGNING_KEY: process.env.SIGNICAT_PRIVATE_SIGNING_KEY,
    SIGNICAT_DOMAIN: process.env.SIGNICAT_DOMAIN,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_FINGERPRINTJS_TOKEN:
      process.env.NEXT_PUBLIC_FINGERPRINTJS_TOKEN,
    NEXT_PUBLIC_POLYGON_ID_RPC_URL: process.env.NEXT_PUBLIC_POLYGON_ID_RPC_URL,
    SIGNICAT_ISSUER: process.env.SIGNICAT_ISSUER,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
