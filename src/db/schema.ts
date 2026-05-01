import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const decks = sqliteTable("decks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  notes: text("notes").default(""),
  repetitions: integer("repetitions").default(0),
  interval: real("interval").default(0),
  easeFactor: real("ease_factor").default(2.5),
  nextReview: text("next_review"),
  lastReviewed: text("last_reviewed"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const cardTags = sqliteTable("card_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
  tags: many(tags),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  cardTags: many(cardTags),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  deck: one(decks, {
    fields: [tags.deckId],
    references: [decks.id],
  }),
  cardTags: many(cardTags),
}));

export const cardTagsRelations = relations(cardTags, ({ one }) => ({
  card: one(cards, {
    fields: [cardTags.cardId],
    references: [cards.id],
  }),
  tag: one(tags, {
    fields: [cardTags.tagId],
    references: [tags.id],
  }),
}));
