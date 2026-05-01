import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { id, cardId } = await params;
    const body = await request.json();
    const { front, back, notes } = body;

    const updates: Record<string, string | undefined> = {
      updatedAt: new Date().toISOString(),
    };
    if (front !== undefined) updates.front = front?.trim();
    if (back !== undefined) updates.back = back?.trim();
    if (notes !== undefined) updates.notes = notes?.trim() ?? "";

    const [card] = await db
      .update(cards)
      .set(updates)
      .where(
        and(
          eq(cards.id, Number(cardId)),
          eq(cards.deckId, Number(id))
        )
      )
      .returning();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch {
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { id, cardId } = await params;
    await db
      .delete(cards)
      .where(
        and(
          eq(cards.id, Number(cardId)),
          eq(cards.deckId, Number(id))
        )
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
