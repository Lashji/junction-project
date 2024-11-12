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
import {
  ArrowUpDown,
  BadgeCheck,
  MessageSquare,
  OctagonAlert,
  Sparkle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type Poll,
  type Answer,
  type Comment,
  type Threads,
  type Vote,
} from "~/types";
import { env } from "~/env";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../_context/auth-context";
import AnswerItem from "./answer-item";
import "~/styles/CustomUnderline.css";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "~/components/ui/tooltip";

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

  const queryClient = useQueryClient();

  const {
    data: unansweredPolls,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["polls"],
    queryFn: () => fetchUnAnsweredPolls(userId!),
    enabled: !!userId,
  });

  const { data: userAnswers } = useQuery({
    queryKey: ["userAnswers"],
    queryFn: () => fetchUserAnswers(userId!),
    enabled: !!userId,
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

  // const { mutate: likeCommentMutation } = useMutation({
  //   mutationKey: ["likeComment"],
  //   mutationFn: ({
  //     pollId,
  //     commentId,
  //   }: {
  //     pollId: string;
  //     commentId: string;
  //   }) => handleLikeComment(pollId, commentId),
  // });

  const { data: selectedPollData } = useQuery({
    queryKey: ["poll", selectedPoll?.id],
    queryFn: () => (selectedPoll ? fetchPoll(selectedPoll.id) : null),
    enabled: !!selectedPoll,
  });

  const handleVote = async (pollId: string, answer: string) => {
    if (!userId) return;

    answerPollMutation(
      {
        pollId,
        answer,
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["polls"] });
          void queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
          void queryClient.invalidateQueries({ queryKey: ["userAnswers"] });
        },
      },
    );
  };

  const handleAddComment = async (
    pollId: string,
    content: string,
    threadId: string,
  ) => {
    if (!userId) return;

    createCommentMutation({ pollId, content, threadId });
  };

  // const handleLikeComment = async (pollId: string, commentId: string) => {
  //   if (!userId) return;

  //   likeCommentMutation({ pollId, commentId });
  // };

  const router = useRouter();

  const handlePush = (pollId: string) => {
    router.push("/post/" + pollId);
  };

  return (
    <div>
        <p className="text-center -mb-5">Welcome back, user 91a2k29</p>

      <h1 className="content-2xl h1class mb-4 text-center text-4xl font-bold">
        Ongoing Polls
      </h1>
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
        ) : !unansweredPolls ? (
          <div>Loading ....</div>
        ) : (
          unansweredPolls.map((poll) => (
            <PollItem
              key={poll.id}
              poll={poll}
              onSelect={() => {
                handlePush(poll.id);
                setSelectedPoll(poll);
              }}
              onVote={handleVote}
            />
          ))
        )}
        {userAnswers?.map((answer) => (
          <Link
            key={answer.pollId}
            href={`/post/${answer.pollId}`}
            className="mt-4 block"
          >
            <AnswerItem key={answer.id} answer={answer} />
          </Link>
        ))}
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
  onVote: (pollId: string, answer: string) => void;
}) {
  const { userId } = useAuth();
  const totalVotes = poll.answers.length;

  // Calculate percentages for each option
  const optionStats = poll.options.reduce(
    (acc, option) => {
      const votes = poll.answers.filter(
        (answer) => answer.answer === option,
      ).length;
      const percentage = ((votes / totalVotes) * 100 || 0).toFixed(1);
      return { ...acc, [option]: { votes, percentage } };
    },
    {} as Record<string, { votes: number; percentage: string }>,
  );

  const hasVoted = poll.answers.some((answer) => answer.userId === userId);

  return (
    <div
      className="cursor-pointer rounded-lg bg-white p-4 shadow transition-all duration-300 hover:shadow-lg"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <h2 className="content-lg mb-2 text-xl font-semibold">{poll.title}</h2>

        <div className="flex space-x-2">
          {poll.requireVerification && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <BadgeCheck className="text-blue-500" size={38} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified users only</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {poll.isActionable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <OctagonAlert className="text-red-500" size={38} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actionable Poll</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <p className="mb-3 text-sm">{poll.description}</p>

      {hasVoted ? (
        <></>
      ) : (
        <>
          <div className="w-100 relative mb-2 flex h-10 overflow-hidden border-2 border-amber-600">
            <div
              className={`bg-[#FFB89A] transition-all duration-500 ease-out`}
              style={{ width: `50%` }}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-medium text-primary">
              Vote to see the real results!
            </p>
            <div
              className={`border-l-2 border-amber-500 bg-[#FFA97A] transition-all duration-500 ease-out`}
              style={{ width: `50%` }}
            />
          </div>

          <div className="mb-2 flex justify-between">
            {poll.options.map((option) => (
              <Button
                className="p-7"
                key={option}
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(poll.id, option);
                }}
                variant="outline"
              >
                Vote {option}
              </Button>
            ))}
          </div>
        </>
      )}

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
