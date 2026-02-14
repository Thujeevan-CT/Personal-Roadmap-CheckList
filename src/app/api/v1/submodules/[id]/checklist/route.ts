import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SubModule, ChecklistItem } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
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
    const items = await ChecklistItem.find({ subModuleId: toObjectId(id) })
      .sort({ order: 1 })
      .lean();
    const list = (items as any[]).map((c) => serializeDoc(c));
    return successResponse(list);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { title } = parseBody<{ title: string }>(body);
    if (!title || typeof title !== "string" || !title.trim()) {
      return errorResponse("VALIDATION_ERROR", "title is required", 400);
    }
    await connectDB();
    const sub = await SubModule.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!sub) return errorResponse("NOT_FOUND", "SubModule not found", 404);
    const subObj = sub as any;
    const count = await ChecklistItem.countDocuments({ subModuleId: toObjectId(id) });
    const item = await ChecklistItem.create({
      subModuleId: toObjectId(id),
      roadmapId: subObj.roadmapId,
      title: title.trim(),
      isCompleted: false,
      order: count,
      createdBy: toObjectId(user.id),
    });
    return successResponse(serializeDoc(item), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
