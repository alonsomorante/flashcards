import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { groups, cards } from "../db/schema";
import { CreateGroupSchema, UpdateGroupSchema } from "../types";

const app = new Hono();

app.get("/", async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const deckGroups = await db
    .select()
    .from(groups)
    .where(eq(groups.deckId, deckId))
    .orderBy(groups.displayOrder);
  return c.json(deckGroups);
});

app.post("/", zValidator("json", CreateGroupSchema), async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const body = c.req.valid("json");
  const [group] = await db
    .insert(groups)
    .values({
      deckId,
      name: body.name.trim(),
      displayOrder: Number(body.displayOrder) || 0,
    })
    .returning();
  return c.json(group, 201);
});

app.put("/:groupId", zValidator("json", UpdateGroupSchema), async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const groupId = Number(c.req.param("groupId"));
  const body = c.req.valid("json");

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.displayOrder !== undefined) updates.displayOrder = Number(body.displayOrder);

  const [group] = await db
    .update(groups)
    .set(updates)
    .where(and(eq(groups.id, groupId), eq(groups.deckId, deckId)))
    .returning();

  if (!group) return c.json({ error: "Group not found" }, 404);
  return c.json(group);
});

app.delete("/:groupId", async (c) => {
  const deckId = Number(c.req.param("deckId"));
  const groupId = Number(c.req.param("groupId"));

  await db.update(cards).set({ groupId: null }).where(eq(cards.groupId, groupId));

  await db
    .delete(groups)
    .where(and(eq(groups.id, groupId), eq(groups.deckId, deckId)));

  return c.json({ success: true });
});

export default app;
