import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cardTags, tags } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { cardId } = await params;

    const result = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(cardTags)
      .innerJoin(tags, eq(cardTags.tagId, tags.id))
      .where(eq(cardTags.cardId, Number(cardId)));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch card tags" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const body = await request.json();
    const { tagId } = body;

    if (!tagId || typeof tagId !== "number") {
      return NextResponse.json(
        { error: "tagId is required" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(cardTags)
      .where(
        and(
          eq(cardTags.cardId, Number(cardId)),
          eq(cardTags.tagId, tagId)
        )
      );

    if (existing) {
      return NextResponse.json(existing);
    }

    const [cardTag] = await db
      .insert(cardTags)
      .values({
        cardId: Number(cardId),
        tagId,
      })
      .returning();

    return NextResponse.json(cardTag, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to assign tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        { error: "tagId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(cardTags)
      .where(
        and(
          eq(cardTags.cardId, Number(cardId)),
          eq(cardTags.tagId, Number(tagId))
        )
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove tag" },
      { status: 500 }
    );
  }
}
