import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DeckDetailClient } from "./deck-detail-client";

export const dynamic = "force-dynamic";

async function getDeck(id: number) {
  const [deck] = await db.select().from(decks).where(eq(decks.id, id));
  if (!deck) return null;

  const deckCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, id));

  return { ...deck, cards: deckCards };
}

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = await getDeck(Number(id));

  if (!deck) notFound();

  return <DeckDetailClient deck={deck} />;
}
