import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { tags, cardTags } from "../db/schema";
import { CreateTagSchema } from "../types";

const app = new Hono();

app.get("/", async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const deckTags = await db
    .select()
    .from(tags)
    .where(eq(tags.deckId, deckId))
    .orderBy(tags.name);
  return c.json(deckTags);
});

app.post("/", zValidator("json", CreateTagSchema), async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const body = c.req.valid("json");
  const [tag] = await db
    .insert(tags)
    .values({ deckId, name: body.name.trim() })
    .returning();
  return c.json(tag, 201);
});

app.delete("/:tagId", async (c) => {
  const tagId = Number(c.req.param("tagId"));
  await db.delete(cardTags).where(eq(cardTags.tagId, tagId));
  await db.delete(tags).where(eq(tags.id, tagId));
  return c.json({ success: true });
});

// Card tags
app.get("/:cardId/tags", async (c) => {
  const cardId = Number(c.req.param("cardId"));
  const result = await db
    .select({ tagId: tags.id, tagName: tags.name })
    .from(cardTags)
    .innerJoin(tags, eq(cardTags.tagId, tags.id))
    .where(eq(cardTags.cardId, cardId));
  return c.json(result);
});

app.post("/:cardId/tags", async (c) => {
  const cardId = Number(c.req.param("cardId"));
  const body = await c.req.json();
  const tagId = body.tagId;

  if (!tagId || typeof tagId !== "number") {
    return c.json({ error: "tagId is required" }, 400);
  }

  const [existing] = await db
    .select()
    .from(cardTags)
    .where(and(eq(cardTags.cardId, cardId), eq(cardTags.tagId, tagId)));

  if (existing) return c.json(existing);

  const [cardTag] = await db
    .insert(cardTags)
    .values({ cardId, tagId })
    .returning();

  return c.json(cardTag, 201);
});

app.delete("/:cardId/tags", async (c) => {
  const cardId = Number(c.req.param("cardId"));
  const tagId = Number(c.req.query("tagId"));

  if (!tagId) return c.json({ error: "tagId is required" }, 400);

  await db
    .delete(cardTags)
    .where(and(eq(cardTags.cardId, cardId), eq(cardTags.tagId, tagId)));

  return c.json({ success: true });
});

export default app;
