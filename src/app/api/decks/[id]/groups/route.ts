import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups, cards } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckId = Number(id);

    const deckGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.deckId, deckId))
      .orderBy(asc(groups.displayOrder));

    return NextResponse.json(deckGroups);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch groups" },
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
    const { name, displayOrder = 0 } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const [group] = await db
      .insert(groups)
      .values({
        deckId: Number(id),
        name: name.trim(),
        displayOrder: Number(displayOrder) || 0,
      })
      .returning();

    return NextResponse.json(group, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
