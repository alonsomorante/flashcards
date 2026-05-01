import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags, cardTags } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const { id, tagId } = await params;

    await db
      .delete(cardTags)
      .where(eq(cardTags.tagId, Number(tagId)));

    await db
      .delete(tags)
      .where(
        and(
          eq(tags.id, Number(tagId)),
          eq(tags.deckId, Number(id))
        )
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
