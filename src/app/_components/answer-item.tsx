import { useQuery } from "@tanstack/react-query";
import { env } from "~/env";
import { Poll, type Answer } from "~/types";
import { ArrowUpDown, MessageSquare } from "lucide-react";
import { Button } from "~/components/ui/button";

const fetchPoll = async (pollId: string) => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/getPoll?pollId=${pollId}`,
  );

  const data = (await response.json()) as unknown as Poll;
  console.log("GET POLL ", data);

  return data;
};

export default function AnswerItem({ answer }: { answer: Answer }) {
  const {
    data: poll,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["poll", answer.pollId],
    queryFn: () => fetchPoll(answer.pollId),
    enabled: !!answer.pollId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!poll) return <div>No poll found</div>;

  const totalVotes = poll.answers.length;
  const firstOptionVotes = poll.answers.filter((a) => a.answer === poll.options[0]).length;
  const firstOptionPercentage = parseInt(((firstOptionVotes / totalVotes) * 100 || 0).toFixed(1));

  return (
    
    <div className="cursor-pointer rounded-lg bg-white p-4 shadow transition-all duration-300 hover:shadow-lg">
      <h2 className="content-lg mb-2 font-semibold">{poll.title}</h2>

      <p className="font-medium text-center">Your answer: {answer.answer}</p>

      <div className="relative mb-2 flex h-8 overflow-hidden">
        <div className="relative mb-2 flex h-8 w-full overflow-hidden border-2 border-amber-600">
          <div
            className={`bg-[#FFB89A] transition-all duration-500 ease-out flex items-center justify-center`}
            style={{ width: `${firstOptionPercentage}%` }}
          >
            <p className="text-primary">{firstOptionPercentage}%</p>
          </div>
          <div
            className={`border-l-2 border-amber-500 bg-[#FFA97A] transition-all duration-500 ease-out flex items-center justify-center`}
            style={{ width: `${100 - firstOptionPercentage}%` }}
          >
            <p className="text-primary">{100 - firstOptionPercentage}%</p>
          </div>
        </div>
      </div>

      <div className="content-sm mb-2 flex justify-between">
        {poll.options.map((option, index) => {
          const votes = poll.answers.filter((a) => a.answer === option).length;
          const percentage = ((votes / totalVotes) * 100 || 0).toFixed(1);

          return (
            <span
              key={option}
              className={`content-${index === 0 ? "blue" : "red"}-500`}
            >
              {option}: {percentage}%
            </span>
          );
        })}
      </div>

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
  userId: string,
): Promise<unknown> {
  throw new Error("Function not implemented.");
}
