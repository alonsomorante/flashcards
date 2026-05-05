import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { z } from "zod";

const BatchCardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
      notes: z.string().optional(),
      groupId: z.number().optional(),
    })
  ).min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = BatchCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: expected array of cards with front and back" },
        { status: 400 }
      );
    }

    const deckId = Number(id);
    const cardValues = parsed.data.cards.map((card) => ({
      deckId,
      groupId: card.groupId ?? null,
      front: card.front.trim(),
      back: card.back.trim(),
      notes: card.notes?.trim() ?? "",
    }));

    const inserted = await db
      .insert(cards)
      .values(cardValues)
      .returning();

    return NextResponse.json({ cards: inserted }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create cards" },
      { status: 500 }
    );
  }
}
