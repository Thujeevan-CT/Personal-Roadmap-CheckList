import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SubModule, FileAttachment } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { subModuleId, roadmapId, fileName, fileKey, fileSize, mimeType } = parseBody<{
      subModuleId: string;
      roadmapId: string;
      fileName: string;
      fileKey: string;
      fileSize: number;
      mimeType: string;
    }>(body);
    if (!subModuleId || !roadmapId || !fileName || !fileKey || typeof fileSize !== "number") {
      return errorResponse("VALIDATION_ERROR", "subModuleId, roadmapId, fileName, fileKey, fileSize required", 400);
    }
    await connectDB();
    const sub = await SubModule.findOne({
      _id: toObjectId(subModuleId),
      createdBy: toObjectId(user.id),
    });
    if (!sub) return errorResponse("NOT_FOUND", "SubModule not found", 404);
    const file = await FileAttachment.create({
      subModuleId: toObjectId(subModuleId),
      roadmapId: toObjectId(roadmapId),
      fileName,
      fileKey,
      fileSize,
      mimeType: mimeType || "application/octet-stream",
      uploadedBy: toObjectId(user.id),
    });
    return successResponse(serializeDoc(file), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
