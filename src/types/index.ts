

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

export type Answer = {
  id: string;
  userId: string;
  pollId: string;
  answer: string;
  createdAt: string;
};

/**
export type Poll = {
  id: number;
  question: string;
  options: [string, string];
  votes: [number, number];
  comments: [Comment[], Comment[]];
  createdAt: Date;
  userVoted: boolean;
  justVoted: boolean;
};
*/

export type Poll = {
  id: string;
  title: string;
  description: string;
  options: string[];
  answers: Answer[];
  comments: Comment[];
};

/**
 * export type Comment = {
  id: string;
  text: string;
  likes: number;
  userLiked: boolean;
};

 */

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