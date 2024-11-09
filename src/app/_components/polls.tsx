"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowUpDown, MessageSquare, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Poll, Answer, Comment, Threads, Vote } from "~/types";
import { env } from "~/env";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useStore } from "~/store";
import { useAuth } from "../_context/auth-context";
import "~/styles/CustomUnderline.css"

const fetchUnAnsweredPolls = async (userId: string) => {
  console.log("fetching polls", userId);

  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getUnansweredPolls?userId=${userId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as unknown as Poll[];
  console.log("response", data);
  return data;
};

const fetchPollThreads = async (pollId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getPollThreads?pollId=${pollId}`,
  );

  const data = (await response.json()) as unknown as Threads;
  console.log("poll threads", data);

  return data;
};

const createComment = async (
  pollId: string,
  content: string,
  userId: string,
  threadId: string,
) => {
  const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/createComment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pollId,
      content,
      userId,
      threadId,
    }),
  });

  const data = (await response.json()) as unknown as Comment;
  console.log("create comment", data);

  return data;
};

const fetchLastRepliedThreadForUser = async (
  userId: string,
  pollId: string,
) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getLastRepliedThreadForUser?userId=${userId}&pollId=${pollId}`,
  );

  const data = (await response.json()) as unknown as Comment;
  console.log("last replied thread", data);

  return data;
};

const fetchUserComments = async (userId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getUserComments?userId=${userId}`,
  );

  const data = (await response.json()) as unknown as Comment[];
  console.log("user comments", data);

  return data;
};

const fetchUserAnswers = async (userId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getUserAnswers?userId=${userId}`,
  );

  const data = (await response.json()) as unknown as Answer[];
  console.log("user answers", data);

  return data;
};

const fetchPoll = async (pollId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getPoll?pollId=${pollId}`,
  );

  const data = (await response.json()) as unknown as Poll;
  console.log("GET POLL ", data);

  return data;
};

const answerPoll = async (pollId: string, answer: string, userId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/answerPoll?pollId=${pollId}&answer=${answer}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer,
        pollId,
        userId,
      }),
    },
  );

  const data = (await response.json()) as unknown as Answer;
  console.log("ANSWER POLL", data);

  return data;
};

const fetchCommentVotes = async (commentId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getCommentVotes?commentId=${commentId}`,
  );

  const data = (await response.json()) as unknown as Vote;
  console.log("comment votes", data);

  return data;
};

export default function Polls() {
  const [sortBy, setSortBy] = useState<"top" | "new">("top");
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  const { isAuthenticated, userId } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["polls"],
    queryFn: () => fetchUnAnsweredPolls(userId!),
    enabled: isAuthenticated && !!userId,
  });

  const { data: userAnswers } = useQuery({
    queryKey: ["userAnswers"],
    queryFn: () => fetchUserAnswers(userId!),
    enabled: isAuthenticated && !!userId,
  });

  const { mutate: answerPollMutation } = useMutation({
    mutationKey: ["answerPoll"],
    mutationFn: ({ pollId, answer }: { pollId: string; answer: string }) =>
      answerPoll(pollId, answer, userId!),
  });

  const { mutate: createCommentMutation } = useMutation({
    mutationKey: ["createComment"],
    mutationFn: ({
      pollId,
      content,
      threadId,
    }: {
      pollId: string;
      content: string;
      threadId: string;
    }) => createComment(pollId, content, userId!, threadId),
  });

  const { mutate: likeCommentMutation } = useMutation({
    mutationKey: ["likeComment"],
    mutationFn: ({
      pollId,
      commentId,
    }: {
      pollId: string;
      commentId: string;
    }) => likeComment(pollId, commentId, userId!),
  });

  const handleVote = async (pollId: string, answer: string) => {
    if (!userId) return;

    answerPollMutation({ pollId, answer });
  };

  const handleAddComment = async (
    pollId: string,
    content: string,
    threadId: string,
  ) => {
    if (!userId) return;

    createCommentMutation({ pollId, content, threadId });
  };

  const handleLikeComment = async (pollId: string, commentId: string) => {
    if (!userId) return;

    likeCommentMutation({ pollId, commentId });
  };

  const router = useRouter();

  const handlePush = (pollId: string) => {
    router.push("/post/" + pollId);
  };

  return (
    <div>
      <h1 className="content-2xl mb-4 font-bold h1class text-4xl text-center">Ongoing Polls</h1>
      <div className="mb-4 flex items-center">
        <span className="content-sm mr-2 font-medium">Sort by:</span>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as "top" | "new")}
        >
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="bg-card" value="top">
              {" "}
              Top Posts
            </SelectItem>
            <SelectItem value="new">Recent Posts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error.message}</div>
        ) : (
          data?.map((poll) => (
            <PollItem
              key={poll.id}
              poll={poll}
              onSelect={() => {
                console.log(poll.id);
                handlePush(poll.id);
                setSelectedPoll(poll);
              }}
              onVote={() => {
                console.log("vote");
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PollItem({
  poll,
  onSelect,
  onVote,
}: {
  poll: Poll;
  onSelect: () => void;
  onVote: (pollId: string, optionIndex: number) => void;
}) {
  const totalVotes = poll.answers.length;
  const percentages = poll.options.map((option) => {
    const count = poll.answers.filter(
      (answer) => answer.answer === option,
    ).length;
    return ((count / totalVotes) * 100).toFixed(1);
  });

  return (
    <div
      className="cursor-pointer rounded-lg bg-white p-4 shadow transition-all duration-300 hover:shadow-lg"
      onClick={onSelect}
    >
      <h2 className="content-lg mb-2 font-semibold">{poll.title}</h2>
      {/* {!poll.userVoted && (
        <> */}
      {/* <p className="content-sm content-gray-500 mb-2">
            Vote to see the results.
          </p>

          <div className="w-100 relative mb-2 flex h-8 overflow-hidden rounded-full">
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              add
            </p>
            <div
              className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
              style={{ width: `50%` }}
            />
            <p className="content-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              Vote to see the real results!
            </p>
            <div
              className={`bg-red-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
              style={{ width: `50%` }}
            />
          </div>
        </>
      )}
      {poll.userVoted ? (
        <>
          <>
            <div className="relative mb-2 flex h-8 overflow-hidden rounded-full">
              <div
                className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
                style={{ width: `${percentages[0]}%`, position: "relative" }}
              >
                <span className="content-white absolute inset-0 flex items-center justify-center">
                  {percentages[0]}%
                </span>
              </div>
              <div
                className={`bg-red-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
                style={{ width: `${percentages[1]}%`, position: "relative" }}
              >
                <span className="content-white absolute inset-0 flex items-center justify-center">
                  {percentages[1]}%
                </span>
              </div>
            </div>
            <div className="content-sm mb-2 flex justify-between">
              <span className="content-blue-500">
                {poll.options[0]}: {percentages[0]}%
              </span>
              <span className="content-red-500">
                {poll.options[1]}: {percentages[1]}%
              </span>
            </div>
          </> */}
      {/* </>
      ) : ( */}
      <div className="mb-2 flex justify-between">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onVote(poll.id, 0);
          }}
          variant="outline"
        >
          Vote {poll.options[0]}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onVote(poll.id, 1);
          }}
          variant="outline"
        >
          Vote {poll.options[1]}
        </Button>
      </div>
      {/* )} */}
      <div className="content-sm content-gray-500 mt-2 flex items-center justify-between">
        <span>
          <ArrowUpDown className="mr-1 inline" size={16} />
          {totalVotes} votes
        </span>
        <span>
          <MessageSquare className="mr-1 inline" size={16} />
          {poll.comments.length} comments
        </span>
      </div>
    </div>
  );
}
function likeComment(
  pollId: string,
  commentId: string,
  arg2: string,
): Promise<unknown> {
  throw new Error("Function not implemented.");
}
