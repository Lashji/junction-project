"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowUpDown, MessageSquare, ThumbsUp } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Visitor from "./visitor";
import { Comment, Poll } from "~/types";

const initialPolls: Poll[] = [
  {
    id: 1,
    question: "Do you prefer coffee or tea?",
    options: ["Coffee", "Tea"],
    votes: [150, 100],
    comments: [
      [
        {
          id: "1",
          text: "I love the aroma of coffee!",
          likes: 5,
          userLiked: false,
        },
        {
          id: "2",
          text: "Can't start my day without it",
          likes: 3,
          userLiked: false,
        },
      ],
      [
        { id: "3", text: "Tea is so soothing", likes: 4, userLiked: false },
        {
          id: "4",
          text: "I prefer the variety of flavors in tea",
          likes: 2,
          userLiked: false,
        },
      ],
    ],
    createdAt: new Date("2023-05-01"),
    userVoted: false,
    justVoted: false,
  },
  {
    id: 2,
    question: "Cats or dogs?",
    options: ["Cats", "Dogs"],
    votes: [120, 180],
    comments: [
      [
        {
          id: "5",
          text: "Cats are so independent",
          likes: 6,
          userLiked: false,
        },
        {
          id: "6",
          text: "I love how graceful they are",
          likes: 3,
          userLiked: false,
        },
      ],
      [
        {
          id: "7",
          text: "Dogs are man's best friend!",
          likes: 7,
          userLiked: false,
        },
        {
          id: "8",
          text: "I love going on walks with my dog",
          likes: 4,
          userLiked: false,
        },
      ],
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
      return b.votes[0] + b.votes[1] - (a.votes[0] + a.votes[1]);
    } else {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const handleVote = (pollId: number, optionIndex: number) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId && !poll.userVoted) {
          const newVotes = [...poll.votes];
          newVotes[optionIndex]!++;
          return {
            ...poll,
            votes: newVotes as [number, number],
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
    pollId: number,
    optionIndex: number,
    comment: string,
  ) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId) {
          const newComments = [...poll.comments];
          newComments[optionIndex] = [
            ...newComments[optionIndex]!,
            {
              id: Date.now().toString(),
              text: comment,
              likes: 0,
              userLiked: false,
            },
          ];
          return { ...poll, comments: newComments as [Comment[], Comment[]] };
        }
        return poll;
      }),
    );
  };

  const handleLikeComment = (
    pollId: number,
    optionIndex: number,
    commentId: string,
  ) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId) {
          const newComments = [...poll.comments];
          newComments[optionIndex] = newComments[optionIndex]!.map((comment) =>
            comment.id === commentId && !comment.userLiked
              ? { ...comment, likes: comment.likes + 1, userLiked: true }
              : comment,
          );
          return { ...poll, comments: newComments as [Comment[], Comment[]] };
        }
        return poll;
      }),
    );
  };

  const router = useRouter();

  const handlePush = (pollsID: number) => {
    router.push("/post/" + pollsID);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Poll App</h1>
      <div className="mb-4 flex items-center">
        <span className="mr-2 text-sm font-medium">Sort by:</span>
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

      {/** 
       
      <PollDialog 
        poll={selectedPoll} 
        onClose={() => setSelectedPoll(null)} 
        onVote={handleVote}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      **/}
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
  onVote: (pollId: number, optionIndex: number) => void;
}) {
  const totalVotes = poll.votes[0] + poll.votes[1];
  const percentages = poll.votes.map((votes) =>
    ((votes / totalVotes) * 100).toFixed(1),
  );

  return (
    <div
      className="cursor-pointer rounded-lg bg-white p-4 shadow transition-all duration-300 hover:shadow-lg"
      onClick={onSelect}
    >
      <h2 className="mb-2 text-lg font-semibold">{poll.question}</h2>
      {!poll.userVoted && (
        <>
          <p className="mb-2 text-sm text-gray-500">Vote to see the results.</p>

          <div className="w-100 relative mb-2 flex h-8 overflow-hidden rounded-full">
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              add
            </p>
            <div
              className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
              style={{ width: `50%` }}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white">Vote to see the real results!</p>
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
            <div className="mb-2 relative flex h-8 overflow-hidden rounded-full">
              <div
                className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
                style={{ width: `${percentages[0]}%`, position: 'relative' }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  {percentages[0]}%
                </span>
              </div>
              <div
                className={`bg-red-500 transition-all duration-500 ease-out ${poll.justVoted ? "animate-pulse" : ""}`}
                style={{ width: `${percentages[1]}%`, position: 'relative' }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  {percentages[1]}%
                </span>
              </div>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-blue-500">
                {poll.options[0]}: {percentages[0]}%
              </span>
              <span className="text-red-500">
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
      <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
        <span>
          <ArrowUpDown className="mr-1 inline" size={16} />
          {totalVotes} votes
        </span>
        <span>
          <MessageSquare className="mr-1 inline" size={16} />
          {poll.comments[0].length + poll.comments[1].length} comments
        </span>
      </div>
    </div>
  );
}

/** 
function PollDialog({ poll, onClose, onVote, onAddComment, onLikeComment }: { 
  poll: Poll | null, 
  onClose: () => void, 
  onVote: (pollId: number, optionIndex: number) => void,
  onAddComment: (pollId: number, optionIndex: number, comment: string) => void,
  onLikeComment: (pollId: number, optionIndex: number, commentId: string) => void
}) {
  const [newComments, setNewComments] = useState(['', ''])

  if (!poll) return null

  const totalVotes = poll.votes[0] + poll.votes[1]
  const percentages = poll.votes.map(votes => ((votes / totalVotes) * 100).toFixed(1))

  const handleAddComment = (optionIndex: number) => {
    if (newComments[optionIndex]!.trim()) {
      onAddComment(poll.id, optionIndex, newComments[optionIndex]!.trim())
      setNewComments(prev => {
        const updated = [...prev]
        updated[optionIndex] = ''
        return updated
      })
    }
  }

  return (
    <Dialog open={!!poll} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{poll.question}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex-grow overflow-hidden">
          {!poll.userVoted && (
            <p className="text-sm text-gray-500 mb-2">Vote to see the results.</p>
          )}
          {poll.userVoted ? (
            <>
              <div className="flex h-8 rounded-full overflow-hidden mb-2">
                <div 
                  className={`bg-blue-500 transition-all duration-500 ease-out ${poll.justVoted ? 'animate-pulse' : ''}`}
                  style={{ width: `${percentages[0]}%` }}
                />
                <div 
                  className={`bg-red-500 transition-all duration-500 ease-out ${poll.justVoted ? 'animate-pulse' : ''}`}
                  style={{ width: `${percentages[1]}%` }}
                />
              </div>
              <div className="flex justify-between mb-4 text-lg font-semibold">
                <span className="text-blue-500">{poll.options[0]}: {percentages[0]}%</span>
                <span className="text-red-500">{poll.options[1]}: {percentages[1]}%</span>
              </div>
            </>
          ) : (
            <div className="flex justify-center mb-4">
              <Button onClick={() => onVote(poll.id, 0)} variant="outline" className="mr-4">
                Vote {poll.options[0]}
              </Button>
              <Button onClick={() => onVote(poll.id, 1)} variant="outline">
                Vote {poll.options[1]}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 h-[calc(100%-6rem)] overflow-hidden">
            {poll.options.map((option, index) => (
              <div key={option} className="flex flex-col h-full">
                <h3 className="font-semibold mb-2 text-lg">{option} Comments:</h3>
                <ScrollArea className="flex-grow mb-4 pr-4">
                  {poll.comments[index]!
                    .sort((a, b) => b.likes - a.likes)
                    .map((comment) => (
                      <div key={comment.id} className="bg-gray-100 p-3 rounded-lg mb-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <p className="text-sm mb-2">{comment.text}</p>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onLikeComment(poll.id, index, comment.id)}
                            disabled={comment.userLiked}
                          >
                            <ThumbsUp className={`w-4 h-4 mr-1 ${comment.userLiked ? 'text-blue-500' : ''}`} />
                            {comment.likes}
                          </Button>
                        </div>
                      </div>
                    ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={newComments[index]}
                    onChange={(e) => setNewComments(prev => {
                      const updated = [...prev]
                      updated[index] = e.target.value
                      return updated
                    })}
                    placeholder={`Comment on ${option}...`}
                  />
                  <Button onClick={() => handleAddComment(index)}>Post</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
**/
