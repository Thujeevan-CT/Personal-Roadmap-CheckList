import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { RoadmapFolder } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { serializeMany, serializeDoc, toObjectId } from "@/lib/db/serialize";

export async function GET() {
  try {
    const user = await requireSession();
    await connectDB();
    const folders = await RoadmapFolder.find({ createdBy: toObjectId(user.id) })
      .sort({ order: 1 })
      .lean();
    return successResponse(serializeMany(folders as any[]));
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) {
      return (e as { response: Response }).response;
    }
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { name } = parseBody<{ name: string }>(body);
    if (!name || typeof name !== "string" || !name.trim()) {
      return errorResponse("VALIDATION_ERROR", "name is required", 400);
    }
    await connectDB();
    const count = await RoadmapFolder.countDocuments({
      createdBy: toObjectId(user.id),
    });
    const folder = await RoadmapFolder.create({
      name: name.trim(),
      createdBy: toObjectId(user.id),
      order: count,
    });
    return successResponse(serializeDoc(folder as any), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) {
      return (e as { response: Response }).response;
    }
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

