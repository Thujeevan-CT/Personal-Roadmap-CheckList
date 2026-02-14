import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SubModule, FileAttachment } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await connectDB();
    const sub = await SubModule.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!sub) return errorResponse("NOT_FOUND", "SubModule not found", 404);
    const files = await FileAttachment.find({
      subModuleId: toObjectId(id),
    })
      .sort({ createdAt: -1 })
      .lean();
    const list = (files as any[]).map((f) => serializeDoc(f));
    return successResponse(list);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
