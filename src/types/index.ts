import { z } from "zod";

export type TokenData = {
  iss: string;
  nbf: number;
  iat: number;
  exp: number;
  aud: string;
  amr: string[];
  at_hash: string;
  sid: string;
  sub: string;
  auth_time: number;
  idp: string;
  name: string;
  family_name: string;
  given_name: string;
  gender: string;
  birthdate: string;
  idp_issuer: string;
  sandbox: boolean;
};

export const credentialDataSchema = z.object({
  name: z.string(),
  gender: z.string(),
  age: z.string(),
  nationality: z.string(),
});

export type CredentialData = z.infer<typeof credentialDataSchema>;

export type Answer = {
  id: string;
  userId: string;
  pollId: string;
  answer: string;
  createdAt: string;
};

export type Poll = {
  id: string;
  title: string;
  description: string;
  options: string[];
  answers: Answer[];
  comments: Comment[];
  requireVerification: boolean;
  isActionable: boolean;
};

export type Threads = Record<string, Comment[]>;

export type Comment = {
  id: string;
  content: string;
  pollAnswer: string;
  userId: string;
  pollId: string;
  threadId: string;
  threadPosition: number;
  createdAt: string;
};

export type Vote = {
  upvotes: number;
  downvotes: number;
  score: number;
};

export type IssuedCredential = {
  id: string;
  proofTypes: string[];
  revoked: boolean;
  schemaHash: string;
  vc: Credential;
};
