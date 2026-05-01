import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq, sql, or, isNull, lte } from "drizzle-orm";
import { sm2 } from "@/lib/sm2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const now = new Date().toISOString();

    const baseQuery = db
      .select()
      .from(cards)
      .where(eq(cards.deckId, Number(deckId)))
      .$dynamic();

    if (!all) {
      baseQuery.where(
        or(isNull(cards.nextReview), lte(cards.nextReview, now))
      );
    }

    const studyCards = await baseQuery.orderBy(sql`random()`);

    return NextResponse.json(studyCards);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch study cards" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const body = await request.json();
    const { cardId, quality } = body;

    if (typeof quality !== "number" || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be a number between 0 and 5" },
        { status: 400 }
      );
    }

    const [card] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, Number(cardId)));

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const result = sm2(quality, {
      repetitions: card.repetitions ?? 0,
      interval: card.interval ?? 0,
      easeFactor: card.easeFactor ?? 2.5,
    });

    const now = new Date().toISOString();

    const [updated] = await db
      .update(cards)
      .set({
        repetitions: result.repetitions,
        interval: result.interval,
        easeFactor: result.easeFactor,
        nextReview: result.nextReview,
        lastReviewed: now,
        updatedAt: now,
      })
      .where(eq(cards.id, Number(cardId)))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
