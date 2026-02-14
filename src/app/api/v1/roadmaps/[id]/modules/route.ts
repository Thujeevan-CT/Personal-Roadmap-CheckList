import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Roadmap, Module } from "@/lib/db/models";
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
    const roadmap = await Roadmap.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!roadmap) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    const modules = await Module.find({ roadmapId: toObjectId(id) })
      .sort({ order: 1 })
      .lean();
    const list = (modules as any[]).map((m) => serializeDoc(m));
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
    const { title, description } = parseBody<{ title: string; description?: string }>(body);
    if (!title || typeof title !== "string" || !title.trim()) {
      return errorResponse("VALIDATION_ERROR", "title is required", 400);
    }
    await connectDB();
    const roadmap = await Roadmap.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!roadmap) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    const count = await Module.countDocuments({ roadmapId: toObjectId(id) });
    const mod = await Module.create({
      roadmapId: toObjectId(id),
      title: title.trim(),
      description: description?.trim(),
      order: count,
      createdBy: toObjectId(user.id),
    });
    return successResponse(serializeDoc(mod), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
