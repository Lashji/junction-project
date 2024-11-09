import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { credentialDataSchema } from "~/types";

export const issuerRouter = createTRPCRouter({
  issueCredential: publicProcedure
    .input(z.object({ did: z.string(), credentialData: credentialDataSchema }))
    .query(async ({ input }) => {
      const issuerUrl = "https://b531e9f8450f.ngrok.app";

      const credentialSchema = {
        credentialSchema:
          "ipfs://QmRKRs2hsV9TRtRevW31DmoKrLssbv6iwwzxdcA7VDhpFU",
        type: "test",
        credentialSubject: {
          id: input.did,
          Age: input.credentialData.age,
          Gender: input.credentialData.gender,
          Nationality: input.credentialData.nationality,
          name: input.credentialData.name,
        },
        expiration: 1903357766,
      };
      const authString = Buffer.from(
        `${env.ISSUER_USERNAME}:${env.ISSUER_PASSWORD}`,
      ).toString("base64");

      const response = await fetch(
        `${issuerUrl}/v2/identities/did:polygonid:polygon:amoy:2qXpxUxiJXdPBBP9jbjK6skPAkVywCbPmv5Ro6aPtp/credentials`,
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(credentialSchema),
        },
      );

      if (!response.ok) {
        console.log();

        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to issue credential",
        });
      }

      const data = (await response.json()) as unknown as { id: string };
      console.log("response", data);

      const credentialResponse = await fetch(
        `${issuerUrl}/v2/identities/did:polygonid:polygon:amoy:2qXpxUxiJXdPBBP9jbjK6skPAkVywCbPmv5Ro6aPtp/credentials/${data.id}`,
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Basic ${authString}`,
          },
        },
      );

      const credentialData = (await credentialResponse.json()) as unknown;

      console.log("credentialData", credentialData);

      return credentialData;
    }),
});
