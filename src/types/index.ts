export type Comment = {
  id: string;
  text: string;
  likes: number;
  userLiked: boolean;
};

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
