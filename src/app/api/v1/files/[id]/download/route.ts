import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { FileAttachment } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { toObjectId } from "@/lib/db/serialize";
import { getPresignedGetUrl } from "@/lib/s3/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await connectDB();
    const file = await FileAttachment.findOne({
      _id: toObjectId(id),
      uploadedBy: toObjectId(user.id),
    });
    if (!file) return errorResponse("NOT_FOUND", "File not found", 404);
    const key = (file as any).fileKey;
    const downloadUrl = await getPresignedGetUrl(key);
    return successResponse({ downloadUrl, fileName: (file as any).fileName });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
