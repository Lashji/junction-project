"use client";
import { useRouter } from "next/navigation";

export default function Post() {
  return <div></div>;
}

/** 
 * 'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThumbsUp, MessageSquare, Send } from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Comment = {
  id: string
  text: string
  likes: number
  userLiked: boolean
  userVote: 0 | 1 | null
  replies: Comment[]
}

type Poll = {
  id: number
  question: string
  options: [string, string]
  votes: [number, number]
  comments: Comment[]
  userVoted: 0 | 1 | null
}

const pollData: Poll = {
  id: 1,
  question: "Do you prefer coffee or tea?",
  options: ["Coffee", "Tea"],
  votes: [150, 100],
  comments: [
    {
      id: '1',
      text: "I love the aroma of coffee!",
      likes: 5,
      userLiked: false,
      userVote: 0,
      replies: [
        {
          id: '2',
          text: "Me too! Nothing beats the smell of fresh coffee in the morning.",
          likes: 3,
          userLiked: false,
          userVote: 0,
          replies: []
        }
      ]
    },
    {
      id: '3',
      text: "Tea is so soothing",
      likes: 4,
      userLiked: false,
      userVote: 1,
      replies: []
    }
  ],
  userVoted: null
}

export default function PollDetail() {
  const [poll, setPoll] = useState<Poll>(pollData)
  const [newComment, setNewComment] = useState('')
  const [randomComment, setRandomComment] = useState<Comment | null>(null)
  const [replyToRandom, setReplyToRandom] = useState('')
  const [showRandomComment, setShowRandomComment] = useState(false)
  const { id } = useParams()
  const randomCommentRef = useRef<HTMLDivElement>(null)

  const totalVotes = poll.votes[0] + poll.votes[1]
  const percentages = poll.votes.map(votes => ((votes / totalVotes) * 100).toFixed(1))

  const handleVote = (optionIndex: 0 | 1) => {
    setPoll(prevPoll => {
      const newVotes = [...prevPoll.votes]
      newVotes[optionIndex]++
      return { ...prevPoll, votes: newVotes as [number, number], userVoted: optionIndex }
    })
    setShowRandomComment(true)
    selectRandomComment(optionIndex)
  }

  const selectRandomComment = (votedOption: 0 | 1) => {
    const oppositeComments = poll.comments.filter(comment => comment.userVote !== votedOption)
    if (oppositeComments.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppositeComments.length)
      setRandomComment(oppositeComments[randomIndex])
    } else {
      setRandomComment(null)
    }
  }

  const handleReplyToRandom = () => {
    if (randomComment && replyToRandom.trim()) {
      setPoll(prevPoll => ({
        ...prevPoll,
        comments: prevPoll.comments.map(comment => 
          comment.id === randomComment.id
            ? { ...comment, replies: [...comment.replies, {
                id: Date.now().toString(),
                text: replyToRandom.trim(),
                likes: 0,
                userLiked: false,
                userVote: poll.userVoted,
                replies: []
              }]}
            : comment
        )
      }))
      setReplyToRandom('')
      setShowRandomComment(false)
      setTimeout(() => {
        randomCommentRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleSkipRandom = () => {
    setShowRandomComment(false)
  }

  const handleAddComment = () => {
    if (newComment.trim() && poll.userVoted !== null) {
      setPoll(prevPoll => ({
        ...prevPoll,
        comments: [
          {
            id: Date.now().toString(),
            text: newComment.trim(),
            likes: 0,
            userLiked: false,
            userVote: poll.userVoted,
            replies: []
          },
          ...prevPoll.comments
        ]
      }))
      setNewComment('')
    }
  }

  const handleLikeComment = (commentId: string) => {
    setPoll(prevPoll => ({
      ...prevPoll,
      comments: likeComment(prevPoll.comments, commentId)
    }))
  }

  const likeComment = (comments: Comment[], id: string): Comment[] => {
    return comments.map(comment => {
      if (comment.id === id) {
        return { ...comment, likes: comment.likes + 1, userLiked: true }
      }
      if (comment.replies.length > 0) {
        return { ...comment, replies: likeComment(comment.replies, id) }
      }
      return comment
    })
  }

  const handleReply = (commentId: string, replyText: string) => {
    setPoll(prevPoll => ({
      ...prevPoll,
      comments: addReply(prevPoll.comments, commentId, replyText)
    }))
  }

  const addReply = (comments: Comment[], id: string, replyText: string): Comment[] => {
    return comments.map(comment => {
      if (comment.id === id) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now().toString(),
              text: replyText,
              likes: 0,
              userLiked: false,
              userVote: poll.userVoted,
              replies: []
            }
          ]
        }
      }
      if (comment.replies.length > 0) {
        return { ...comment, replies: addReply(comment.replies, id, replyText) }
      }
      return comment
    })
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Polls</Link>
      <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: poll.userVoted !== null ? `${percentages[0]}%` : '50%' }}
          />
        </div>
        <div className="flex justify-between mb-2">
          {poll.options.map((option, index) => (
            <div key={option} className="text-center">
              <Button 
                onClick={() => handleVote(index as 0 | 1)} 
                disabled={poll.userVoted !== null}
                variant={poll.userVoted === index ? "default" : "outline"}
              >
                {option}
              </Button>
              {poll.userVoted !== null && (
                <div className="mt-2">
                  <div className="font-bold">{percentages[index]}%</div>
                  <div className="text-sm text-gray-500">{poll.votes[index]} votes</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showRandomComment && randomComment && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">What do you think of this?</h3>
          <p className="mb-2">{randomComment.text}</p>
          <div className="flex gap-2">
            <Input
              value={replyToRandom}
              onChange={(e) => setReplyToRandom(e.target.value)}
              placeholder="Your reply..."
            />
            <Button onClick={handleReplyToRandom}>Reply</Button>
            <Button variant="outline" onClick={handleSkipRandom}>Skip</Button>
          </div>
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button onClick={poll.userVoted !== null ? handleAddComment : undefined}>Post</Button>
            </PopoverTrigger>
            {poll.userVoted === null && (
              <PopoverContent className="w-auto">
                <p>Before commenting, please vote</p>
              </PopoverContent>
            )}
          </Popover>
        </div>
        <div className="space-y-4">
          {poll.comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onLike={handleLikeComment}
              onReply={handleReply}
              pollOptions={poll.options}
              isRandom={comment.id === randomComment?.id}
              randomCommentRef={randomCommentRef}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment, onLike, onReply, pollOptions, isRandom, randomCommentRef, depth = 0 }: { 
  comment: Comment, 
  onLike: (id: string) => void, 
  onReply: (id: string, text: string) => void,
  pollOptions: [string, string],
  isRandom?: boolean,
  randomCommentRef?: React.RefObject<HTMLDivElement>,
  depth?: number
}) {
  const [replyText, setReplyText] = useState('')
  const [showReplyInput, setShowReplyInput] = useState(false)

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim())
      setReplyText('')
      setShowReplyInput(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'border-l-2 pl-4 ml-4' : ''}`} ref={isRandom ? randomCommentRef : undefined}>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="mb-2">{comment.text}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Voted for: {comment.userVote !== null ? pollOptions[comment.userVote] : 'Unknown'}</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onLike(comment.id)}
              disabled={comment.userLiked}
            >
              <ThumbsUp className={`w-4 h-4 mr-1 ${comment.userLiked ? 'text-blue-500' : ''}`} />
              {comment.likes}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReplyInput(!showReplyInput)}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Reply
            </Button>
          </div>
        </div>
        {showReplyInput && (
          <div className="mt-2 flex gap-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Your reply..."
            />
            <Button onClick={handleReply}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      {comment.replies.length > 0 && (
        <div className="mt-2">
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
  )
}
*/
