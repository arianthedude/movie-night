import { SwipeFeed } from "@/components/SwipeFeed";

type Props = { params: Promise<{ id: string }> };

export default async function FeedPage({ params }: Props) {
  const { id } = await params;
  return <SwipeFeed sessionId={id} />;
}
