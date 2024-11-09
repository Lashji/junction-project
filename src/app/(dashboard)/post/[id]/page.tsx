"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ThumbsUp, MessageSquare, Send } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import Navbar from "~/app/_components/navbar";
import { env } from "~/env";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Answer, Comment, Vote, Poll } from "~/types";
import { useAuth } from "~/app/_context/auth-context";

const fetchPoll = async (pollId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getPoll?pollId=${pollId}`,
  );

  const data = (await response.json()) as unknown as Poll;
  console.log("GET POLL ", data);

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

// Add this new component for a better discussion input
function DiscussionInput({
  value,
  onChange,
  onSubmit,
  userAnswered,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  userAnswered: boolean;
}) {
  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">Join the Discussion</h3>
      <div className="space-y-4">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={
            userAnswered
              ? "Share your thoughts on this poll..."
              : "Vote on the poll to join the discussion"
          }
          disabled={!userAnswered}
          className="min-h-[120px] w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {!userAnswered && "You need to vote before commenting"}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                onClick={userAnswered ? onSubmit : undefined}
                className="bg-amber-500 px-6 hover:bg-amber-600 disabled:opacity-50"
                disabled={!userAnswered || !value.trim()}
              >
                Post Comment
              </Button>
            </PopoverTrigger>
            {!userAnswered && (
              <PopoverContent className="w-auto p-3">
                <p className="text-sm text-gray-600">
                  Please vote on the poll first
                </p>
              </PopoverContent>
            )}
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default function PollDetail() {
  const [showRandomComment, setShowRandomComment] = useState(false);
  const [randomComment, setRandomComment] = useState<Comment | null>(null);
  const [replyToRandom, setReplyToRandom] = useState("");
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();

  const { userId } = useAuth();
  const randomCommentRef = useRef<HTMLDivElement>(null);

  console.log("ID", id);

  const queryClient = useQueryClient();

  const { data: selectedPollData } = useQuery({
    queryKey: ["poll"],
    queryFn: () => (typeof id === "string" ? fetchPoll(id) : null),
    enabled: !!id,
  });

  const { data: userAnswers } = useQuery({
    queryKey: ["userAnswers"],
    queryFn: () => (typeof id === "string" ? fetchUserAnswers(id) : null),
    enabled: !!id,
  });

  const { mutate: addComment } = useMutation({
    mutationKey: ["addComment"],
    mutationFn: (comment: string) =>
      answerPoll(selectedPollData?.id!, comment, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll"] });
    },
  });

  const userAnswered = useMemo(() => {
    return userAnswers?.some(
      (answer) => answer.pollId === selectedPollData?.id,
    );
  }, [userAnswers, selectedPollData?.id]);

  console.log("selectedPollData", selectedPollData);

  const handleVote = (optionIndex: 0 | 1) => {
    // setPoll((prevPoll) => {
    //   const newVotes = [...prevPoll.votes];
    //   newVotes[optionIndex]!++;
    //   return {
    //     ...prevPoll,
    //     votes: newVotes as [number, number],
    //     userVoted: optionIndex,
    //   };
    // });
    // setShowRandomComment(true);
    // selectRandomComment(optionIndex);
  };

  const selectRandomComment = (votedOption: 0 | 1) => {
    // const oppositeComments = poll.comments.filter(
    //   (comment) => comment.userVote !== votedOption,
    // );
    // if (oppositeComments.length > 0) {
    //   const randomIndex = Math.floor(Math.random() * oppositeComments.length);
    //   setRandomComment(oppositeComments[randomIndex]!);
    // } else {
    //   setRandomComment(null);
    // }
  };

  const handleReplyToRandom = () => {
    // if (randomComment && replyToRandom.trim()) {
    //   setPoll((prevPoll) => ({
    //     ...prevPoll,
    //     comments: prevPoll.comments.map((comment) =>
    //       comment.id === randomComment.id
    //         ? {
    //             ...comment,
    //             replies: [
    //               ...comment.replies,
    //               {
    //                 id: Date.now().toString(),
    //                 text: replyToRandom.trim(),
    //                 likes: 0,
    //                 userLiked: false,
    //                 userVote: poll.userVoted,
    //                 replies: [],
    //               },
    //             ],
    //           }
    //         : comment,
    //     ),
    //   }));
    // setReplyToRandom("");
    // setShowRandomComment(false);
    // setTimeout(() => {
    //   randomCommentRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, 100);
  };
  // }

  const handleSkipRandom = () => {
    // setShowRandomComment(false);
  };

  const handleAddComment = () => {
    addComment(newComment);
    setNewComment("");
  };

  const handleLikeComment = (commentId: string) => {
    // setPoll((prevPoll) => ({
    //   ...prevPoll,
    //   comments: likeComment(prevPoll.comments, commentId),
    // }));
  };

  const likeComment = (comments: Comment[], id: string) => {
    // return comments.map((comment) => {
    //   if (comment.id === id) {
    //     return { ...comment, likes: comment.likes + 1, userLiked: true };
    //   }
    //   if (comment.replies.length > 0) {
    //     return { ...comment, replies: likeComment(comment.replies, id) };
    //   }
    //   return comment;
    // });
  };

  const handleReply = (commentId: string, replyText: string) => {
    // Type-safe comment handling would go here
  };

  const addReply = (comments: Comment[], id: string, replyText: string) => {
    // return comments.map((comment) => {
    //   if (comment.id === id) {
    //     return {
    //       ...comment,
    //       replies: [
    //         ...comment.replies,
    //         {
    //           id: Date.now().toString(),
    //           text: replyText,
    //           likes: 0,
    //           userLiked: false,
    //           userVote: poll.userVoted,
    //           replies: [],
    //         },
    //       ],
    //     };
    //   }
    //   if (comment.replies.length > 0) {
    //     return {
    //       ...comment,
    //       replies: addReply(comment.replies, id, replyText),
    //     };
    //   }
    //   return comment;
    // });
    // };
  };

  const voteCounts = useMemo(() => {
    if (!selectedPollData) return [0, 0];
    const [a, b] = selectedPollData.options;
    const aVotes = selectedPollData.answers.filter(
      (answer) => answer.answer === a,
    ).length;
    const bVotes = selectedPollData.answers.filter(
      (answer) => answer.answer === b,
    ).length;
    return [aVotes, bVotes];
  }, [selectedPollData?.answers, selectedPollData?.options]);

  const percentages = useMemo(() => {
    if (!selectedPollData) return [0, 0];
    const totalVotes = selectedPollData.answers.length;
    const [a, b] = selectedPollData.options;

    const aVotes = voteCounts[0];
    const bVotes = voteCounts[1];

    const aPercentage = aVotes ? (aVotes / totalVotes) * 100 : 0;
    const bPercentage = bVotes ? (bVotes / totalVotes) * 100 : 0;

    return [aPercentage, bPercentage];
  }, [voteCounts, selectedPollData?.answers.length, selectedPollData?.options]);

  if (!selectedPollData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-blue-500 hover:text-blue-600"
        >
          &larr; <span className="ml-2">Back to Polls</span>
        </Link>

        <div className="rounded-xl bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <h1 className="mb-6 text-2xl font-bold">{selectedPollData.title}</h1>
          <p className="mb-6 text-gray-600">{selectedPollData.description}</p>

          <div className="mb-8">
            {!userAnswered ? (
              <>
                <div className="relative mb-4 h-12 overflow-hidden rounded-lg border-2 border-amber-600">
                  <div className="absolute h-full w-1/2 bg-[#FFB89A]" />
                  <div className="absolute h-full w-1/2 translate-x-full border-l-2 border-amber-500 bg-[#FFA97A]" />
                  <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium text-primary">
                    Vote to see the real results!
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedPollData.options.map((option, index) => (
                    <Button
                      key={option}
                      onClick={() => handleVote(index as 0 | 1)}
                      className="h-14 w-full text-lg"
                      variant="outline"
                    >
                      Vote {option}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {selectedPollData.options.map((option, index) => (
                  <div key={option} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      <span className="text-sm text-gray-500">
                        {voteCounts[index]} votes (
                        {percentages[index]?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-[#FFB89A] transition-all duration-500"
                        style={{ width: `${percentages[index]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Discussion</h2>

          <DiscussionInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onSubmit={handleAddComment}
            userAnswered={userAnswered ?? false}
          />

          {/* Comments list */}
          <div className="space-y-4">
            {selectedPollData?.comments?.length > 0 ? (
              selectedPollData.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLikeComment}
                  onReply={handleReply}
                  pollOptions={selectedPollData.options}
                  isRandom={comment.id === randomComment?.id}
                  randomCommentRef={randomCommentRef}
                />
              ))
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="text-gray-500">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface CommentItemProps {
  comment: Comment;
  onLike: (id: string) => void;
  onReply: (id: string, text: string) => void;
  pollOptions: string[];
  isRandom?: boolean;
  randomCommentRef?: React.RefObject<HTMLDivElement>;
  depth?: number;
}

function CommentItem({
  comment,
  onLike,
  onReply,
  isRandom,
  randomCommentRef,
  depth = 0,
}: CommentItemProps) {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div
      className={`${depth > 0 ? "ml-6 border-l-2 border-gray-100 pl-6" : ""}`}
      ref={isRandom ? randomCommentRef : undefined}
    >
      <div className="rounded-lg bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <p className="mb-3 text-gray-800">{comment.content}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-600">Voted: {comment.pollAnswer}</span>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id)}
              className="text-gray-500 hover:text-blue-500"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-gray-500 hover:text-blue-500"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Reply
            </Button>
          </div>
        </div>

        {showReplyInput && (
          <div className="mt-4 flex gap-3">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (replyText.trim()) {
                  onReply(comment.id, replyText.trim());
                  setReplyText("");
                  setShowReplyInput(false);
                }
              }}
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
