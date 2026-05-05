import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups, cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
    const body = await request.json();
    const { name, displayOrder } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);

    const [group] = await db
      .update(groups)
      .set(updates)
      .where(
        and(
          eq(groups.id, Number(groupId)),
          eq(groups.deckId, Number(id))
        )
      )
      .returning();

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch {
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
    
    // First, move all cards in this group to no group (or delete them)
    await db
      .update(cards)
      .set({ groupId: null })
      .where(eq(cards.groupId, Number(groupId)));

    await db
      .delete(groups)
      .where(
        and(
          eq(groups.id, Number(groupId)),
          eq(groups.deckId, Number(id))
        )
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
