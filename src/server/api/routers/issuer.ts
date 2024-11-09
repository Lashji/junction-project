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
      const issuerUrl = env.NEXT_PUBLIC_ISSUER_URL;

      const response = await fetch(`${issuerUrl}/credential-issuance`, {
        method: "POST",
        body: JSON.stringify({ did: input.did }),
      });

      if (!response.ok) {
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to issue credential",
        });
      }

      const data = (await response.json()) as unknown;

      return {
        // greeting: `Hello ${input.text}`,
        data,
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
