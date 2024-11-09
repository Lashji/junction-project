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
