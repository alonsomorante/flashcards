import { cache } from "react";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { desc } from "drizzle-orm";

export const getDecks = cache(async () => {
  return db.select().from(decks).orderBy(desc(decks.updatedAt));
});
