import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { cards } from "../db/schema";
import { CreateCardSchema, UpdateCardSchema, BatchCardsSchema } from "../types";

const app = new Hono();

app.get("/", async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const deckCards = await db.select().from(cards).where(eq(cards.deckId, deckId));
  return c.json(deckCards);
});

app.post("/", zValidator("json", CreateCardSchema), async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const body = c.req.valid("json");

  const [card] = await db
    .insert(cards)
    .values({
      deckId,
      groupId: body.groupId,
      front: body.front.trim(),
      back: body.back.trim(),
      notes: body.notes?.trim() ?? "",
    })
    .returning();

  return c.json(card, 201);
});

app.post("/batch", zValidator("json", BatchCardsSchema), async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const body = c.req.valid("json");

  const values = body.cards.map((card) => ({
    deckId,
    groupId: card.groupId ?? null,
    front: card.front.trim(),
    back: card.back.trim(),
    notes: card.notes?.trim() ?? "",
  }));

  const inserted = await db.insert(cards).values(values).returning();
  return c.json({ cards: inserted }, 201);
});

app.put("/:cardId", zValidator("json", UpdateCardSchema), async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const cardId = Number(c.req.param("cardId"));
  const body = c.req.valid("json");

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (body.front !== undefined) updates.front = body.front.trim();
  if (body.back !== undefined) updates.back = body.back.trim();
  if (body.notes !== undefined) updates.notes = body.notes.trim() ?? "";

  const [card] = await db
    .update(cards)
    .set(updates)
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
    .returning();

  if (!card) return c.json({ error: "Card not found" }, 404);
  return c.json(card);
});

app.delete("/:cardId", async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const cardId = Number(c.req.param("cardId"));

  await db
    .delete(cards)
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)));

  return c.json({ success: true });
});

export default app;
