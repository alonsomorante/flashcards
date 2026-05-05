import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq, sql, or, and, isNull, lte } from "drizzle-orm";
import { ankiSM2 } from "@/lib/anki-sm2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const groupId = searchParams.get("groupId");

    const now = new Date();
    const nowISO = now.toISOString();

    let conditions = eq(cards.deckId, Number(deckId));
    
    if (groupId) {
      conditions = sql`${conditions} AND ${cards.groupId} = ${Number(groupId)}`;
    }

    const allCards = await db
      .select()
      .from(cards)
      .where(conditions);

    if (all) {
      return NextResponse.json(allCards);
    }

    // Filter cards that are due:
    // 1. New cards (state = 'new')
    // 2. Learning/Relearning cards with expired dueMinutes
    // 3. Review cards with nextReview <= now
    const dueCards = allCards.filter((card) => {
      const state = card.state ?? "new";
      
      if (state === "new") {
        return true; // New cards are always due
      }
      
      if (state === "learning" || state === "relearning") {
        // Check if dueMinutes have expired
        const lastReviewed = card.lastReviewed ? new Date(card.lastReviewed) : null;
        const dueMinutes = card.dueMinutes ?? 1;
        
        if (!lastReviewed) return true; // Never reviewed, show it
        
        const dueTime = new Date(lastReviewed.getTime() + dueMinutes * 60 * 1000);
        return now >= dueTime;
      }
      
      if (state === "review") {
        const nextReview = card.nextReview;
        if (!nextReview) return true;
        return nextReview <= nowISO;
      }
      
      return false;
    });

    // Sort: learning cards first (by due time), then review cards, then new cards
    const sortedCards = dueCards.sort((a, b) => {
      const stateA = a.state ?? "new";
      const stateB = b.state ?? "new";
      
      // Learning/relearning cards come first
      if ((stateA === "learning" || stateA === "relearning") && 
          (stateB !== "learning" && stateB !== "relearning")) {
        return -1;
      }
      if ((stateB === "learning" || stateB === "relearning") && 
          (stateA !== "learning" && stateA !== "relearning")) {
        return 1;
      }
      
      // Both learning: sort by due time
      if ((stateA === "learning" || stateA === "relearning") && 
          (stateB === "learning" || stateB === "relearning")) {
        const lastReviewedA = a.lastReviewed ? new Date(a.lastReviewed) : new Date(0);
        const lastReviewedB = b.lastReviewed ? new Date(b.lastReviewed) : new Date(0);
        const dueMinutesA = a.dueMinutes ?? 1;
        const dueMinutesB = b.dueMinutes ?? 1;
        
        const dueTimeA = new Date(lastReviewedA.getTime() + dueMinutesA * 60 * 1000);
        const dueTimeB = new Date(lastReviewedB.getTime() + dueMinutesB * 60 * 1000);
        
        return dueTimeA.getTime() - dueTimeB.getTime();
      }
      
      // Then review cards by nextReview
      if (stateA === "review" && stateB === "review") {
        return (a.nextReview ?? nowISO).localeCompare(b.nextReview ?? nowISO);
      }
      
      return 0;
    });

    return NextResponse.json(sortedCards);
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

    if (typeof quality !== "number" || quality < 1 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be a number between 1 and 5" },
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

    const result = ankiSM2(quality, {
      state: (card.state ?? "new") as "new" | "learning" | "review" | "relearning",
      learningStep: card.learningStep ?? 0,
      interval: card.interval ?? 0,
      easeFactor: card.easeFactor ?? 2.5,
      repetitions: card.repetitions ?? 0,
    });

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      state: result.state,
      learningStep: result.learningStep,
      dueMinutes: result.dueMinutes,
      repetitions: result.repetitions,
      interval: result.interval,
      easeFactor: result.easeFactor,
      nextReview: result.nextReview,
      lastReviewed: now,
      lastRating: quality,
      updatedAt: now,
    };

    // Remove null values for dueMinutes and nextReview
    if (result.dueMinutes === null) {
      updateData.dueMinutes = null;
    }
    if (result.nextReview === null) {
      updateData.nextReview = null;
    }

    const [updated] = await db
      .update(cards)
      .set(updateData)
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
