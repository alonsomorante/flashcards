import { z } from "zod";

export const DeckSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  description: z.string().default(""),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateDeckSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateDeckSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const GroupSchema = z.object({
  id: z.number().int(),
  deckId: z.number().int(),
  name: z.string().min(1),
  displayOrder: z.number().int().default(0),
  createdAt: z.string().datetime().optional(),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(1),
  displayOrder: z.number().int().optional(),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  displayOrder: z.number().int().optional(),
});

export const CardSchema = z.object({
  id: z.number().int(),
  deckId: z.number().int(),
  groupId: z.number().int().nullable().optional(),
  front: z.string().min(1),
  back: z.string().min(1),
  notes: z.string().default(""),
  state: z.enum(["new", "learning", "review", "relearning"]).default("new"),
  learningStep: z.number().int().default(0),
  dueMinutes: z.number().int().nullable().optional(),
  repetitions: z.number().int().default(0),
  interval: z.number().default(0),
  easeFactor: z.number().default(2.5),
  nextReview: z.string().datetime().nullable().optional(),
  lastReviewed: z.string().datetime().nullable().optional(),
  lastRating: z.number().int().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateCardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  notes: z.string().optional(),
  groupId: z.number().int(),
});

export const UpdateCardSchema = z.object({
  front: z.string().min(1).optional(),
  back: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export const BatchCardsSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
      notes: z.string().optional(),
      groupId: z.number().int().optional(),
    })
  ).min(1),
});

export const TagSchema = z.object({
  id: z.number().int(),
  deckId: z.number().int(),
  name: z.string().min(1),
  createdAt: z.string().datetime().optional(),
});

export const CreateTagSchema = z.object({
  name: z.string().min(1),
});

export const RateCardSchema = z.object({
  cardId: z.number().int(),
  quality: z.number().int().min(1).max(5),
});

export const ExtractTextSchema = z.object({
  images: z.array(z.string()).min(1).max(5),
});

export const GenerateFromTextSchema = z.object({
  text: z.string().min(1),
});

export const CorrectTextSchema = z.object({
  text: z.string().min(1),
});

export type Deck = z.infer<typeof DeckSchema>;
export type CreateDeck = z.infer<typeof CreateDeckSchema>;
export type UpdateDeck = z.infer<typeof UpdateDeckSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type CreateGroup = z.infer<typeof CreateGroupSchema>;
export type UpdateGroup = z.infer<typeof UpdateGroupSchema>;
export type Card = z.infer<typeof CardSchema>;
export type CreateCard = z.infer<typeof CreateCardSchema>;
export type UpdateCard = z.infer<typeof UpdateCardSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
