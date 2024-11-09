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

  return (
    <div className="cursor-pointer rounded-lg bg-white p-4 shadow transition-all duration-300 hover:shadow-lg">
      <h2 className="content-lg mb-2 font-semibold">{poll.title}</h2>

      <div className="mb-4 rounded-lg bg-gray-100 p-3">
        <p className="font-medium">Your answer: {answer.answer}</p>
      </div>

      <div className="relative mb-2 flex h-8 overflow-hidden rounded-full">
        {poll.options.map((option, index) => {
          const votes = poll.answers.filter((a) => a.answer === option).length;
          const percentage = ((votes / totalVotes) * 100 || 0).toFixed(1);

          return (
            <div
              key={option}
              className={`${index === 0 ? "bg-blue-500" : "bg-red-500"} transition-all duration-500 ease-out`}
              style={{
                width: `${percentage}%`,
                position: "relative",
              }}
            >
              <span className="content-white absolute inset-0 flex items-center justify-center">
                {percentage}%
              </span>
            </div>
          );
        })}
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
