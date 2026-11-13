import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function SessionIndex({ params }: Props) {
  const { id } = await params;
  redirect(`/sessions/${id}/feed`);
}
