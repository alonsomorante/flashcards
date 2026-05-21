import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";

export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  groupId: integer("group_id")
    .references(() => groups.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  notes: text("notes").default(""),
  state: text("state").default("new"), // 'new' | 'learning' | 'review' | 'relearning'
  learningStep: integer("learning_step").default(0),
  dueMinutes: integer("due_minutes"),
  repetitions: integer("repetitions").default(0),
  interval: real("interval").default(0),
  easeFactor: real("ease_factor").default(2.5),
  nextReview: timestamp("next_review", { withTimezone: true }),
  lastReviewed: timestamp("last_reviewed", { withTimezone: true }),
  lastRating: integer("last_rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cardTags = pgTable("card_tags", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});
