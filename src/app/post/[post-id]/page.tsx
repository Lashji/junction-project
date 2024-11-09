import { useRouter } from "next/navigation";

export default function Post() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/login");
  };

  return <div onClick={handleClick}>Post</div>;
}
