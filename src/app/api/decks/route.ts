import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allDecks = await db
      .select()
      .from(decks)
      .orderBy(desc(decks.updatedAt));
    return NextResponse.json(allDecks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const [deck] = await db
      .insert(decks)
      .values({
        name: name.trim(),
        description: description?.trim() ?? "",
      })
      .returning();

    return NextResponse.json(deck, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create deck" },
      { status: 500 }
    );
  }
}
