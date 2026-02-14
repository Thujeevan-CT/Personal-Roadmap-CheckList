import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Module, SubModule } from "@/lib/db/models";
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
    const mod = await Module.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!mod) return errorResponse("NOT_FOUND", "Module not found", 404);
    const submodules = await SubModule.find({ moduleId: toObjectId(id) })
      .sort({ order: 1 })
      .lean();
    const list = (submodules as any[]).map((s) => serializeDoc(s));
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
    const { title, description, status } = parseBody<{
      title: string;
      description?: string;
      status?: string;
    }>(body);
    if (!title || typeof title !== "string" || !title.trim()) {
      return errorResponse("VALIDATION_ERROR", "title is required", 400);
    }
    await connectDB();
    const mod = await Module.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!mod) return errorResponse("NOT_FOUND", "Module not found", 404);
    const modObj = mod as any;
    const count = await SubModule.countDocuments({ moduleId: toObjectId(id) });
    const sub = await SubModule.create({
      moduleId: toObjectId(id),
      roadmapId: modObj.roadmapId,
      title: title.trim(),
      description: description?.trim(),
      status: ["not_started", "in_progress", "completed", "blocked"].includes(status ?? "")
        ? status
        : "not_started",
      order: count,
      createdBy: toObjectId(user.id),
    });
    return successResponse(serializeDoc(sub), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
