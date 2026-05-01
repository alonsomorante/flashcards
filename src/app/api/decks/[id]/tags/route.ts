import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckTags = await db
      .select()
      .from(tags)
      .where(eq(tags.deckId, Number(id)))
      .orderBy(tags.name);

    return NextResponse.json(deckTags);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    const [tag] = await db
      .insert(tags)
      .values({
        deckId: Number(id),
        name: name.trim(),
      })
      .returning();

    return NextResponse.json(tag, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
