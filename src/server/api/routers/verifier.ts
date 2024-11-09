import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { credentialDataSchema } from "~/types";

export const verifierRouter = createTRPCRouter({
  verify: publicProcedure.mutation(async ({ ctx }) => {
    console.log("VERIFYING");

    const payload = {
      chainID: "80002",
      //   skipClaimRevocationCheck: true,
      scope: [
        {
          circuitId: "credentialAtomicQuerySigV2",
          id: 1731190661,
          query: {
            allowedIssuers: ["*"],
            context: "ipfs://QmZnhD9VRGM1Nrf5j6Eyygb1LqW9GqakcbrKEv4Jg62RMY",
            type: "test",
            // skipClaimRevocationCheck: true,
            credentialSubject: {
              Nationality: {
                $eq: "FIN",
              },
            },
          },
        },
      ],
    };

    // {
    //     "circuitId": "credentialAtomicQuerySigV2",
    //     "id": 1731190661,
    //     "query": {
    //       "allowedIssuers": [
    //         "*"
    //       ],
    //       "context": "ipfs://QmZnhD9VRGM1Nrf5j6Eyygb1LqW9GqakcbrKEv4Jg62RMY",
    //       "type": "test",
    //       "skipClaimRevocationCheck": true,
    //       "credentialSubject": {
    //         "Nationality": {
    //           "$eq": "FIN"
    //         }
    //       }
    //     }
    //   }

    const response = await fetch(`https://79ccaaa567b4.ngrok.app/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("data", data);

    return data;
  }),
});
