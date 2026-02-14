import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { getPresignedPutUrl, buildFileKey } from "@/lib/s3/client";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { roadmapId, subModuleId, fileName, contentType } = parseBody<{
      roadmapId: string;
      subModuleId: string;
      fileName: string;
      contentType: string;
    }>(body);
    if (!roadmapId || !subModuleId || !fileName) {
      return errorResponse("VALIDATION_ERROR", "roadmapId, subModuleId, fileName required", 400);
    }
    const key = buildFileKey(user.id, roadmapId, subModuleId, fileName);
    const uploadUrl = await getPresignedPutUrl(key, contentType || "application/octet-stream");
    return successResponse({ uploadUrl, key });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
