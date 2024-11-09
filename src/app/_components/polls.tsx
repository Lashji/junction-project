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
import { Poll, Answer, Comment } from "~/types";

const initialPolls: Poll[] = [
  {
    id: "1",
    title: "Do you prefer coffee or tea?",
    description: "string",
    options: ["Coffee", "Tea"],
    answers: [
      {
        id: "answer_1",
        userId: "user_1",
        pollId: "1",
        answer: "Coffee",
        createdAt: "2023-05-01T13:09:59.085539",
      },
    ],
    comments: [
      {
        id: "1",
        content: "I love the aroma of coffee!",
      },
      {
        id: "2",
        content: "Can't start my day without it",
      },
    ],
    createdAt: new Date("2023-05-01"),
    userVoted: false,
    justVoted: false,
  },
  {
    id: "2",
    title: "Cats or dogs?",
    description: "string",
    options: ["Cats", "Dogs"],
    answers: [
      {
        id: "answer_2",
        userId: "user_2",
        pollId: "2",
        answer: "Dogs",
        createdAt: "2023-05-15T13:09:59.085539",
      },
    ],
    comments: [
      {
        id: "5",
        content: "Cats are so independent",
        likes: 6,
        userLiked: false,
      },
      {
        id: "6",
        content: "I love how graceful they are",
        likes: 3,
        userLiked: false,
      },
      {
        id: "7",
        content: "Dogs are man's best friend!",
        likes: 7,
        userLiked: false,
      },
      {
        id: "8",
        content: "I love going on walks with my dog",
        likes: 4,
        userLiked: false,
      },
    ],
    createdAt: new Date("2023-05-15"),
    userVoted: false,
    justVoted: false,
  },
];

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [sortBy, setSortBy] = useState<"top" | "new">("top");
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  const sortedPolls = [...polls].sort((a, b) => {
    if (sortBy === "top") {
      return b.answers.length - a.answers.length;
    } else {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const handleVote = (pollId: string, optionIndex: number) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId && !poll.userVoted) {
          const newAnswers = [...poll.answers];
          newAnswers.push({
            id: `answer_${Date.now()}`,
            userId: `user_${Date.now()}`,
            pollId: poll.id,
            answer: poll.options[optionIndex],
            createdAt: new Date().toISOString(),
          });
          return {
            ...poll,
            answers: newAnswers,
            userVoted: true,
            justVoted: true,
          };
        }
        return poll;
      }),
    );

    setTimeout(() => {
      setPolls((polls) =>
        polls.map((poll) =>
          poll.id === pollId ? { ...poll, justVoted: false } : poll,
        ),
      );
    }, 500);
  };

  const handleAddComment = (
    pollId: string,
    comment: string,
  ) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId) {
          const newComments = [...poll.comments];
          newComments.push({
            id: Date.now().toString(),
            content: comment,
            likes: 0,
            userLiked: false,
          });
          return { ...poll, comments: newComments };
        }
        return poll;
      }),
    );
  };

  const handleLikeComment = (
    pollId: string,
    commentId: string,
  ) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId) {
          const newComments = poll.comments.map((comment) =>
            comment.id === commentId && !comment.userLiked
              ? { ...comment, likes: comment.likes + 1, userLiked: true }
              : comment,
          );
          return { ...poll, comments: newComments };
        }
        return poll;
      }),
    );
  };

  const router = useRouter();

  const handlePush = (pollId: string) => {
    router.push("/post/" + pollId);
  };

  return (
    <div>
      <h1 className="mb-4 content-2xl font-bold">Poll App</h1>
      <div className="mb-4 flex items-center">
        <span className="mr-2 content-sm font-medium">Sort by:</span>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as "top" | "new")}
        >
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="bg-card" value="top"> Top Posts</SelectItem>
            <SelectItem value="new">Recent Posts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {sortedPolls.map((poll) => (
          <PollItem
            key={poll.id}
            poll={poll}
            onSelect={() => {
              console.log(poll.id);
              handlePush(poll.id);
              setSelectedPoll(poll);
            }}
            onVote={handleVote}
          />
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
  onVote: (pollId: string, optionIndex: number) => void;
}) {
  const totalVotes = poll.answers.length;
  const percentages = poll.options.map((option) => {
    const count = poll.answers.filter((answer) => answer.answer === option).length;
    return ((count / totalVotes) * 100).toFixed(1);
  });

  return (
    <div
      className="cursor-pointer rounded-lg bg-white p-4 shadow transition-all duration-300 hover:shadow-lg"
      onClick={onSelect}
    >
      <h2 className="mb-2 content-lg font-semibold">{poll.title}</h2>
      {!poll.userVoted && (
        <>
          <p className="mb-2 content-sm content-gray-500">Vote to see the results.</p>

          <div className="w-100 relative mb-2 flex h-8 overflow-hidden rounded-full">
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              add
            </p>
            <div
              className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
              style={{ width: `50%` }}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 content-white">Vote to see the real results!</p>
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
            <div className="mb-2 relative flex h-8 overflow-hidden rounded-full ">
              <div
                className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
                style={{ width: `${percentages[0]}%`, position: 'relative' }}
              >
                <span className="absolute inset-0 flex items-center justify-center content-white">
                  {percentages[0]}%
                </span>
              </div>
              <div
                className={`bg-red-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
                style={{ width: `${percentages[1]}%`, position: 'relative' }}
              >
                <span className="absolute inset-0 flex items-center justify-center content-white">
                  {percentages[1]}%
                </span>
              </div>
            </div>
            <div className="mb-2 flex justify-between content-sm">
              <span className="content-blue-500">
                {poll.options[0]}: {percentages[0]}%
              </span>
              <span className="content-red-500">
                {poll.options[1]}: {percentages[1]}%
              </span>
            </div>
          </>
        </>
      ) : (
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
      )}
      <div className="mt-2 flex items-center justify-between content-sm content-gray-500">
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