import { cache } from "react";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getDeckWithCards = cache(async (id: number) => {
  const [deckResult, cardsResult] = await Promise.all([
    db.select().from(decks).where(eq(decks.id, id)),
    db.select().from(cards).where(eq(cards.deckId, id)),
  ]);

  const deck = deckResult[0];
  if (!deck) return null;

  return { ...deck, cards: cardsResult };
});
