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
  if (!pollId || !answer || !userId) {
    console.error("Missing required parameters for answerPoll");
    return null;
  }
  const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/answerPoll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer,
      pollId,
      userId,
    }),
  });

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

const postComment = async (
  comment: string,
  userId: string,
  pollId: string,
  threadId: string,
) => {
  console.log("posting comment", comment, userId, pollId, threadId);

  if (!comment || !userId || !pollId || !threadId) {
    console.error("Missing required parameters for postComment");
    return null;
  }

  const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/postComment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: comment,
      userId,
      pollId,
      threadId,
    }),
  });

  const data = (await response.json()) as unknown as Comment;
  console.log("POST COMMENT", data);

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
          className="min-h-[120px] w-full rounded-lg border border-amber-200 bg-gray-50 p-4 text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {!userAnswered && "You need to vote before commenting"}
          </p>
          <Button
            onClick={userAnswered ? onSubmit : undefined}
            className="bg-amber-500 px-6 hover:bg-amber-600 disabled:opacity-50"
            disabled={!userAnswered || !value.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add a constant for the theme colors to maintain consistency
const THEME_COLORS = {
  optionA: {
    bg: "#FFB89A",
    border: "#FFB89A",
    text: "#7C2D12", // amber-900 for good contrast
  },
  optionB: {
    bg: "#FFA97A",
    border: "#FFA97A",
    text: "#7C2D12",
  },
};

// Update the Comment type to include replies
type CommentWithReplies = Comment & {
  likes?: number;
  replies?: CommentWithReplies[];
};

// Add this near the top of the file
const DEMO_COMMENTS: CommentWithReplies[] = [
  {
    id: "1",
    content:
      "I strongly believe this is the right approach. The data clearly shows that this option has better long-term benefits.",
    pollAnswer: "Yes",
    userId: "user1",
    pollId: "1",
    threadId: "thread1",
    threadPosition: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 24,
    replies: [
      {
        id: "1.1",
        content:
          "Could you share the specific data you're referring to? I'm interested in seeing the numbers behind this.",
        pollAnswer: "No",
        userId: "user6",
        pollId: "1",
        threadId: "thread1",
        threadPosition: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        likes: 8,
        replies: [
          {
            id: "1.1.1",
            content:
              "Here's a link to the recent study: https://www.tandfonline.com/doi/full/10.1080/13600869.2024.2398915. The key findings on page 47 are particularly relevant.",
            pollAnswer: "Yes",
            userId: "user1",
            pollId: "1",
            threadId: "thread1",
            threadPosition: 2,
            createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
            likes: 15,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    content:
      "While I respect the other perspective, I had to vote No. There are too many uncertainties and potential risks involved.",
    pollAnswer: "No",
    userId: "user2",
    pollId: "1",
    threadId: "thread2",
    threadPosition: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 15,
    replies: [
      {
        id: "2.1",
        content:
          "What specific risks are you most concerned about? I'm curious to understand the opposition better.",
        pollAnswer: "Yes",
        userId: "user7",
        pollId: "1",
        threadId: "thread2",
        threadPosition: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        likes: 6,
      },
    ],
  },
  {
    id: "3",
    content:
      "The economic implications are significant. We've seen similar initiatives succeed in other regions.",
    pollAnswer: "Yes",
    userId: "user3",
    pollId: "1",
    threadId: "thread3",
    threadPosition: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likes: 18,
    replies: [
      {
        id: "3.1",
        content:
          "Those regions had different economic conditions though. We need to consider local factors.",
        pollAnswer: "No",
        userId: "user8",
        pollId: "1",
        threadId: "thread3",
        threadPosition: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        likes: 12,
        replies: [
          {
            id: "3.1.1",
            content:
              "Actually, if you look at the demographic data, our region is quite similar to those success cases.",
            pollAnswer: "Yes",
            userId: "user3",
            pollId: "1",
            threadId: "thread3",
            threadPosition: 2,
            createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
            likes: 9,
          },
        ],
      },
    ],
  },
  {
    id: "4",
    content:
      "The environmental impact alone makes this worth supporting. We need to think long-term.",
    pollAnswer: "Yes",
    userId: "user4",
    pollId: "1",
    threadId: "thread4",
    threadPosition: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likes: 22,
    replies: [
      {
        id: "4.1",
        content:
          "The environmental benefits are overstated. There are hidden costs we're not discussing.",
        pollAnswer: "No",
        userId: "user9",
        pollId: "1",
        threadId: "thread4",
        threadPosition: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        likes: 7,
      },
    ],
  },
  {
    id: "5",
    content:
      "As someone who works in this field, I can confirm that the proposed approach aligns with industry best practices.",
    pollAnswer: "Yes",
    userId: "user5",
    pollId: "1",
    threadId: "thread5",
    threadPosition: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    likes: 31,
    replies: [
      {
        id: "5.1",
        content:
          "Could you elaborate on these best practices? Would love to learn more.",
        pollAnswer: "Yes",
        userId: "user10",
        pollId: "1",
        threadId: "thread5",
        threadPosition: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        likes: 4,
      },
    ],
  },
];

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

  const { data: leastRepliedThread } = useQuery({
    queryKey: ["leastRepliedThread"],
    queryFn: () =>
      typeof id === "string"
        ? fetchLastRepliedThreadForUser(id, userId!)
        : null,
    enabled: !!id && !!userId,
  });
  console.log("leastRepliedThread", leastRepliedThread);

  const { data: unansweredPolls } = useQuery({
    queryKey: ["unansweredPolls"],
    queryFn: () => fetchUnAnsweredPolls(userId!),
    enabled: !!userId,
  });

  const { data: userAnswers } = useQuery({
    queryKey: ["userAnswers"],
    queryFn: () => (typeof id === "string" ? fetchUserAnswers(id) : null),
    enabled: !!id,
  });

  const { mutate: answerPollMutation } = useMutation({
    mutationKey: ["answerPoll"],
    mutationFn: (answer: string) =>
      answerPoll(selectedPollData?.id ?? "", answer, userId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["poll"] });
    },
  });

  const userAnswered = useMemo(() => {
    if (!selectedPollData || !userAnswers) return false;
    return userAnswers.some((answer) => answer.pollId === selectedPollData.id);
  }, [userAnswers, selectedPollData?.id]);

  console.log("selectedPollData", selectedPollData);

  const handleVote = (optionIndex: 0 | 1) => {
    selectRandomComment(optionIndex);
    answerPollMutation(selectedPollData?.options[optionIndex] ?? "");
  };

  const selectRandomComment = (votedOption: 0 | 1) => {
    const oppositeComments = selectedPollData?.comments.filter(
      (comment) => comment.pollAnswer !== votedOption.toString(),
    );
    if (oppositeComments && oppositeComments.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppositeComments.length);
      setRandomComment(oppositeComments[randomIndex]!);
    } else {
      setRandomComment(null);
    }
  };

  const { mutate: postCommentMutation } = useMutation({
    mutationKey: ["postComment"],
    mutationFn: (comment: string) =>
      postComment(comment, userId!, selectedPollData?.id ?? "", ""),
  });

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
    setShowRandomComment(false);
  };

  const handleAddComment = async () => {
    postCommentMutation(newComment);
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
                      disabled={userAnswered}
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
            {/* Use DEMO_COMMENTS instead of selectedPollData.comments */}
            {DEMO_COMMENTS.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLikeComment}
                onReply={handleReply}
                pollOptions={selectedPollData?.options ?? ["Yes", "No"]}
                isRandom={comment.id === randomComment?.id}
                randomCommentRef={randomCommentRef}
              />
            ))}
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

// Update CommentItem to handle nested replies
function CommentItem({
  comment,
  onLike,
  onReply,
  pollOptions,
  isRandom,
  randomCommentRef,
  depth = 0,
}: CommentItemProps & { comment: CommentWithReplies }) {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes ?? 0);
  const [hasLiked, setHasLiked] = useState(false);

  // Determine which option color to use
  const isOptionA = comment.pollAnswer === pollOptions[0];
  const voteColor = isOptionA ? THEME_COLORS.optionA : THEME_COLORS.optionB;

  return (
    <div
      className={`${depth > 0 ? "ml-6 border-l-2 border-amber-200 pl-6" : ""}`}
      ref={isRandom ? randomCommentRef : undefined}
    >
      <div
        className={`rounded-lg p-5 shadow-sm transition-shadow duration-300 hover:shadow-md ${depth === 0 ? "bg-white" : ""} ${depth === 1 ? "bg-amber-50" : ""} ${depth === 2 ? "bg-amber-100/30" : ""} `}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: voteColor.bg,
                color: voteColor.text,
              }}
              className="rounded-full px-4 py-1.5 text-sm font-medium shadow-sm"
            >
              Voted {comment.pollAnswer}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <p className="mb-4 text-gray-800">{comment.content}</p>

        <div className="flex items-center justify-end gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!hasLiked) {
                setLocalLikes((prev) => prev + 1);
                setHasLiked(true);
                onLike(comment.id);
              }
            }}
            className={`${
              hasLiked
                ? "text-amber-600 hover:text-amber-700"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            {localLikes} {localLikes === 1 ? "Like" : "Likes"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-gray-500 hover:text-amber-600"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Reply
          </Button>
        </div>

        {showReplyInput && (
          <div className="mt-4 flex gap-3">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border-amber-200 focus:border-amber-500 focus:ring-amber-200"
            />
            <Button
              onClick={() => {
                if (replyText.trim()) {
                  onReply(comment.id, replyText.trim());
                  setReplyText("");
                  setShowReplyInput(false);
                }
              }}
              className="bg-amber-500 px-6 hover:bg-amber-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                pollOptions={pollOptions}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
