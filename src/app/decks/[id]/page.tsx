import { notFound } from "next/navigation";
import { getDeckWithCards } from "@/lib/deck";
import { DeckDetailClient } from "./deck-detail-client";

export const dynamic = "force-dynamic";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = await getDeckWithCards(Number(id));

  if (!deck) notFound();

  return <DeckDetailClient deck={deck} />;
}
