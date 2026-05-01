import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, Number(id)));
    return NextResponse.json(deckCards);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { front, back, notes } = body;

    if (!front || typeof front !== "string" || front.trim().length === 0) {
      return NextResponse.json(
        { error: "Front text is required" },
        { status: 400 }
      );
    }

    if (!back || typeof back !== "string" || back.trim().length === 0) {
      return NextResponse.json(
        { error: "Back text is required" },
        { status: 400 }
      );
    }

    const [card] = await db
      .insert(cards)
      .values({
        deckId: Number(id),
        front: front.trim(),
        back: back.trim(),
        notes: notes?.trim() ?? "",
      })
      .returning();

    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
