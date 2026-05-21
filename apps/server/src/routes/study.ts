import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { cards } from "../db/schema";
import { RateCardSchema } from "../types";
import { ankiSM2 } from "../lib/anki-sm2";

const app = new Hono();

app.get("/", async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const groupId = c.req.query("groupId");
  const all = c.req.query("all") === "true";

  const now = new Date();
  const nowISO = now.toISOString();

  let conditions = eq(cards.deckId, deckId);

  if (groupId) {
    conditions = and(conditions, eq(cards.groupId, Number(groupId)))!;
  }

  const allCards = await db.select().from(cards).where(conditions);

  if (all) return c.json(allCards);

  const dueCards = allCards.filter((card) => {
    const state = card.state ?? "new";
    if (state === "new") return true;
    if (state === "learning" || state === "relearning") {
      const lastReviewed = card.lastReviewed ? new Date(card.lastReviewed) : null;
      const dueMinutes = card.dueMinutes ?? 1;
      if (!lastReviewed) return true;
      const dueTime = new Date(lastReviewed.getTime() + dueMinutes * 60 * 1000);
      return now >= dueTime;
    }
    if (state === "review") {
      if (!card.nextReview) return true;
      return card.nextReview <= nowISO;
    }
    return false;
  });

  const sortedCards = dueCards.sort((a, b) => {
    const stateA = a.state ?? "new";
    const stateB = b.state ?? "new";

    if ((stateA === "learning" || stateA === "relearning") &&
        (stateB !== "learning" && stateB !== "relearning")) {
      return -1;
    }
    if ((stateB === "learning" || stateB === "relearning") &&
        (stateA !== "learning" && stateA !== "relearning")) {
      return 1;
    }

    if ((stateA === "learning" || stateA === "relearning") &&
        (stateB === "learning" || stateB === "relearning")) {
      const lastReviewedA = a.lastReviewed ? new Date(a.lastReviewed) : new Date(0);
      const lastReviewedB = b.lastReviewed ? new Date(b.lastReviewed) : new Date(0);
      const dueMinutesA = a.dueMinutes ?? 1;
      const dueMinutesB = b.dueMinutes ?? 1;
      const dueTimeA = new Date(lastReviewedA.getTime() + dueMinutesA * 60 * 1000);
      const dueTimeB = new Date(lastReviewedB.getTime() + dueMinutesB * 60 * 1000);
      return dueTimeA.getTime() - dueTimeB.getTime();
    }

    if (stateA === "review" && stateB === "review") {
      return (a.nextReview ?? nowISO).localeCompare(b.nextReview ?? nowISO);
    }

    return 0;
  });

  return c.json(sortedCards);
});

app.post("/", zValidator("json", RateCardSchema), async (c) => {
  const body = c.req.valid("json");
  const { cardId, quality } = body;

  const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
  if (!card) return c.json({ error: "Card not found" }, 404);

  const result = ankiSM2(quality, {
    state: (card.state ?? "new") as "new" | "learning" | "review" | "relearning",
    learningStep: card.learningStep ?? 0,
    interval: card.interval ?? 0,
    easeFactor: card.easeFactor ?? 2.5,
    repetitions: card.repetitions ?? 0,
  });

  const now = new Date();

  const updateData: Record<string, unknown> = {
    state: result.state,
    learningStep: result.learningStep,
    dueMinutes: result.dueMinutes,
    repetitions: result.repetitions,
    interval: result.interval,
    easeFactor: result.easeFactor,
    nextReview: result.nextReview,
    lastReviewed: now,
    lastRating: quality,
    updatedAt: now,
  };

  if (result.dueMinutes === null) updateData.dueMinutes = null;
  if (result.nextReview === null) updateData.nextReview = null;

  const [updated] = await db
    .update(cards)
    .set(updateData)
    .where(eq(cards.id, cardId))
    .returning();

  return c.json(updated);
});

export default app;
