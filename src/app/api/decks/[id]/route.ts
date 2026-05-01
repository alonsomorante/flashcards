import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, Number(id)));

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, Number(id)));

    return NextResponse.json({ ...deck, cards: deckCards });
  } catch {
    return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const [deck] = await db
      .update(decks)
      .set({
        name: name?.trim(),
        description: description?.trim() ?? "",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(decks.id, Number(id)))
      .returning();

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch {
    return NextResponse.json(
      { error: "Failed to update deck" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(decks).where(eq(decks.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete deck" },
      { status: 500 }
    );
  }
}
