import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db";
import { decks, cards, groups } from "../db/schema";
import { CreateDeckSchema, UpdateDeckSchema } from "../types";

function isCardDue(card: typeof cards.$inferSelect): boolean {
  const state = card.state ?? "new";
  const now = new Date();

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
    return card.nextReview <= now.toISOString();
  }

  return false;
}

const app = new Hono();

app.get("/", async (c) => {
  const allDecks = await db.select().from(decks).orderBy(desc(decks.updatedAt));
  return c.json(allDecks);
});

app.post("/", zValidator("json", CreateDeckSchema), async (c) => {
  const body = c.req.valid("json");
  const [deck] = await db
    .insert(decks)
    .values({
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
    })
    .returning();
  return c.json(deck, 201);
});

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const [deckResult] = await db.select().from(decks).where(eq(decks.id, id));
  if (!deckResult) return c.json({ error: "Deck not found" }, 404);

  const groupsResult = await db
    .select()
    .from(groups)
    .where(eq(groups.deckId, id))
    .orderBy(groups.displayOrder);

  const cardsResult = await db.select().from(cards).where(eq(cards.deckId, id));

  const cardsByGroup = new Map<number | null, typeof cardsResult>();
  cardsByGroup.set(null, []);

  for (const card of cardsResult) {
    const gid = card.groupId ?? null;
    if (!cardsByGroup.has(gid)) cardsByGroup.set(gid, []);
    cardsByGroup.get(gid)!.push(card);
  }

  const groupsWithCards = groupsResult.map((group) => {
    const groupCards = cardsByGroup.get(group.id) || [];
    return {
      ...group,
      cards: groupCards,
      dueCount: groupCards.filter(isCardDue).length,
    };
  });

  const ungroupedCards = cardsByGroup.get(null) || [];

  return c.json({
    ...deckResult,
    groups: groupsWithCards,
    ungroupedCards,
    totalDue: cardsResult.filter(isCardDue).length,
  });
});

app.put("/:id", zValidator("json", UpdateDeckSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const body = c.req.valid("json");

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() ?? "";

  const [deck] = await db.update(decks).set(updates).where(eq(decks.id, id)).returning();
  if (!deck) return c.json({ error: "Deck not found" }, 404);
  return c.json(deck);
});

app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(decks).where(eq(decks.id, id));
  return c.json({ success: true });
});

export default app;
