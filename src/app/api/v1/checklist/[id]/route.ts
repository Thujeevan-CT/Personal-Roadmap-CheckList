import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { ChecklistItem } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { title, isCompleted } = body as { title?: string; isCompleted?: boolean };
    await connectDB();
    const item = await ChecklistItem.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!item) return errorResponse("NOT_FOUND", "Checklist item not found", 404);
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title.trim();
    if (typeof isCompleted === "boolean") update.isCompleted = isCompleted;
    const updated = await ChecklistItem.findByIdAndUpdate(id, update, { new: true });
    return successResponse(serializeDoc(updated!));
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const item = await ChecklistItem.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!item) return errorResponse("NOT_FOUND", "Checklist item not found", 404);
    await ChecklistItem.deleteOne({ _id: toObjectId(id) });
    return successResponse({ deleted: true });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
