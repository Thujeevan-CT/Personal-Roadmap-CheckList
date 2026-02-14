import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Note } from "@/lib/db/models";
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
    const { content } = body as { content?: string };
    await connectDB();
    const note = await Note.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!note) return errorResponse("NOT_FOUND", "Note not found", 404);
    const updated = await Note.findByIdAndUpdate(
      id,
      { content: content ?? "" },
      { new: true }
    );
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
    const note = await Note.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!note) return errorResponse("NOT_FOUND", "Note not found", 404);
    await Note.deleteOne({ _id: toObjectId(id) });
    return successResponse({ deleted: true });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
