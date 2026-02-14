import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Note } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";

export async function GET(request: NextRequest) {
  try {
    const user = await requireSession();
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    if (!entityType || !entityId) {
      return errorResponse("VALIDATION_ERROR", "entityType and entityId are required", 400);
    }
    if (!["roadmap", "module", "submodule"].includes(entityType)) {
      return errorResponse("VALIDATION_ERROR", "Invalid entityType", 400);
    }
    await connectDB();
    const notes = await Note.find({
      entityType,
      entityId: toObjectId(entityId),
      createdBy: toObjectId(user.id),
    })
      .sort({ createdAt: 1 })
      .lean();
    const list = (notes as any[]).map((n) => serializeDoc(n));
    return successResponse(list);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { entityType, entityId, roadmapId, content } = parseBody<{
      entityType: "roadmap" | "module" | "submodule";
      entityId: string;
      roadmapId: string;
      content: string;
    }>(body);
    if (!entityType || !entityId || !roadmapId) {
      return errorResponse("VALIDATION_ERROR", "entityType, entityId, roadmapId are required", 400);
    }
    await connectDB();
    const note = await Note.create({
      entityType,
      entityId: toObjectId(entityId),
      roadmapId: toObjectId(roadmapId),
      content: content ?? "",
      createdBy: toObjectId(user.id),
    });
    return successResponse(serializeDoc(note), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
