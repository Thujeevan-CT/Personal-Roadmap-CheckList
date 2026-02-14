import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SubModule, Module } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { toObjectId } from "@/lib/db/serialize";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { ids } = parseBody<{ ids: string[] }>(body);
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse("VALIDATION_ERROR", "ids array is required", 400);
    }
    await connectDB();
    const oids = ids.map((id) => toObjectId(id));
    const subs = await SubModule.find({ _id: { $in: oids }, createdBy: toObjectId(user.id) });
    if (subs.length !== ids.length) {
      return errorResponse("FORBIDDEN", "Some submodules not found or access denied", 403);
    }
    const moduleId = (subs[0] as any).moduleId;
    const mod = await Module.findOne({ _id: moduleId, createdBy: toObjectId(user.id) });
    if (!mod) return errorResponse("FORBIDDEN", "Access denied", 403);
    const bulk = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: toObjectId(id), createdBy: toObjectId(user.id) },
        update: { $set: { order: index } },
      },
    }));
    await SubModule.bulkWrite(bulk);
    return successResponse({ updated: ids.length });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
