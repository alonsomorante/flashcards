import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decks, cards, groups } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckId = Number(id);

    const [deckResult, groupsResult, cardsResult] = await Promise.all([
      db.select().from(decks).where(eq(decks.id, deckId)),
      db.select().from(groups).where(eq(groups.deckId, deckId)).orderBy(asc(groups.displayOrder)),
      db.select().from(cards).where(eq(cards.deckId, deckId)),
    ]);

    const deck = deckResult[0];
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Group cards by their groupId
    const cardsByGroup = new Map<number | null, typeof cardsResult>();
    cardsByGroup.set(null, []); // Cards without group
    
    for (const card of cardsResult) {
      const groupId = card.groupId ?? null;
      if (!cardsByGroup.has(groupId)) {
        cardsByGroup.set(groupId, []);
      }
      cardsByGroup.get(groupId)!.push(card);
    }

    // Build groups with their cards
    const groupsWithCards = groupsResult.map(group => ({
      ...group,
      cards: cardsByGroup.get(group.id) || [],
    }));

    return NextResponse.json({
      ...deck,
      groups: groupsWithCards,
      ungroupedCards: cardsByGroup.get(null) || [],
    });
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
