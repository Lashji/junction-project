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
      // {
      //   "bigInt": "329285357405732062828432696261414574881",
      //   "createdAt": "2024-11-09T18:26:39.148631Z",
      //   "description": "test",
      //   "hash": "215b710323a756247a18e0e7910dbaf7",
      //   "id": "acb470a3-7bac-4bb8-9d6e-1088ebd5af9e",
      //   "title": "jcktest",
      //   "type": "test",
      //   "url": "ipfs://QmRKRs2hsV9TRtRevW31DmoKrLssbv6iwwzxdcA7VDhpFU",
      //   "version": "1.0"
      // }

      const credentialSchema = {
        credentialSchema:
          "ipfs://QmRKRs2hsV9TRtRevW31DmoKrLssbv6iwwzxdcA7VDhpFU",
        type: "test",
        credentialSubject: {
          id: input.did,
          Name: input.credentialData.name,
          Age: input.credentialData.age,
          Gender: input.credentialData.gender,
          Nationality: input.credentialData.nationality,
        },
      };
      const authString = Buffer.from(
        `${env.ISSUER_USERNAME}:${env.ISSUER_PASSWORD}`,
      ).toString("base64");
      const response = await fetch(
        `${issuerUrl}/v2/identities/acb470a3-7bac-4bb8-9d6e-1088ebd5af9e/credentials`,
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(credentialSchema),
        },
      );
      // EXAMPLE PAYLOAD
      //     "credentialSchema": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
      // "type": "KYCAgeCredential",
      // "credentialSubject": {
      //   "id": "fill with did",
      //   "birthday": 19960424,
      //   "documentType": 2
      // },
      // "expiration": 1903357766

      // if (!response.ok) {
      //   console.log();

      // return new TRPCError({
      //   code: "BAD_REQUEST",
      //   message: "Failed to issue credential",
      // });
      // }

      // const data = (await response.json()) as unknown;
      console.log("response", response);

      return {
        // greeting: `Hello ${input.text}`,
        data: response,
      };
    }),
  //   create: protectedProcedure
  //     .input(z.object({ name: z.string().min(1) }))
  //     .mutation(async ({ ctx, input }) => {
  //       await ctx.db.insert(posts).values({
  //         name: input.name,
  //         createdById: ctx.session.user.id,
  //       });
  //     }),
  //   getLatest: protectedProcedure.query(async ({ ctx }) => {
  //     const post = await ctx.db.query.posts.findFirst({
  //       orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  //     });

  //     return post ?? null;
  //   }),

  //   getSecretMessage: protectedProcedure.query(() => {
  //     return "you can now see this secret message!";
  //   }),
});
