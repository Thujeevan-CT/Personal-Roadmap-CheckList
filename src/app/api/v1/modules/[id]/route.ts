import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connection";
import {
  Module,
  SubModule,
  ChecklistItem,
  Note,
  FileAttachment,
} from "@/lib/db/models";
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
    const { title, description } = body as { title?: string; description?: string };
    await connectDB();
    const mod = await Module.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!mod) return errorResponse("NOT_FOUND", "Module not found", 404);
    const updated = await Module.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
      },
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
    const oid = toObjectId(id);
    await connectDB();
    const mod = await Module.findOne({
      _id: oid,
      createdBy: toObjectId(user.id),
    });
    if (!mod) return errorResponse("NOT_FOUND", "Module not found", 404);
    const subModuleIds = (await SubModule.find({ moduleId: oid }).distinct("_id")) as mongoose.Types.ObjectId[];
    await ChecklistItem.deleteMany({ subModuleId: { $in: subModuleIds } });
    await Note.deleteMany({ entityType: "submodule", entityId: { $in: subModuleIds } });
    await FileAttachment.deleteMany({ subModuleId: { $in: subModuleIds } });
    await SubModule.deleteMany({ moduleId: oid });
    await Module.deleteOne({ _id: oid });
    return successResponse({ deleted: true });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
