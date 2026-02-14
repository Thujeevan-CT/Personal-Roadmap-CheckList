import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connection";
import { SubModule, ChecklistItem, Note, FileAttachment } from "@/lib/db/models";
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
    const { title, description, status, dueDate } = body as {
      title?: string;
      description?: string;
      status?: string;
      dueDate?: string | null;
    };
    await connectDB();
    const sub = await SubModule.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!sub) return errorResponse("NOT_FOUND", "SubModule not found", 404);
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description?.trim();
    if (status !== undefined && ["not_started", "in_progress", "completed", "blocked"].includes(status)) {
      update.status = status;
    }
    if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null;
    const updated = await SubModule.findByIdAndUpdate(id, update, { new: true });
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
    const oid = toObjectId(id);
    await connectDB();
    const sub = await SubModule.findOne({
      _id: oid,
      createdBy: toObjectId(user.id),
    });
    if (!sub) return errorResponse("NOT_FOUND", "SubModule not found", 404);
    await ChecklistItem.deleteMany({ subModuleId: oid });
    await Note.deleteMany({ entityType: "submodule", entityId: oid });
    await FileAttachment.deleteMany({ subModuleId: oid });
    await SubModule.deleteOne({ _id: oid });
    return successResponse({ deleted: true });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
