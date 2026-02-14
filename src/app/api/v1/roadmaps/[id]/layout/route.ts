import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Roadmap, RoadmapLayout } from "@/lib/db/models";
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
    const layout = await RoadmapLayout.findOne({ roadmapId: toObjectId(id) }).lean();
    if (!layout) {
      return successResponse({ nodes: [], edges: [], viewport: undefined });
    }
    const out = {
      nodes: (layout as any).nodes ?? [],
      edges: (layout as any).edges ?? [],
      viewport: (layout as any).viewport,
    };
    return successResponse(out);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { nodes, edges, viewport } = parseBody<{
      nodes: { entityId: string; entityType: string; position: { x: number; y: number }; width?: number; height?: number }[];
      edges: { id: string; source: string; target: string; type?: string; label?: string }[];
      viewport?: { x: number; y: number; zoom: number };
    }>(body);
    await connectDB();
    const roadmap = await Roadmap.findOne({
      _id: toObjectId(id),
      createdBy: toObjectId(user.id),
    });
    if (!roadmap) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    const oid = toObjectId(id);
    const layout = await RoadmapLayout.findOneAndUpdate(
      { roadmapId: oid },
      {
        $set: {
          nodes: nodes ?? [],
          edges: edges ?? [],
          ...(viewport && { viewport }),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          roadmapId: oid,
          createdBy: toObjectId(user.id),
        },
      },
      { new: true, upsert: true }
    );
    if (!layout) return errorResponse("INTERNAL_ERROR", "Failed to save layout", 500);
    const created = await RoadmapLayout.findOne({ roadmapId: oid }).lean();
    return successResponse({
      nodes: (created as any)?.nodes ?? [],
      edges: (created as any)?.edges ?? [],
      viewport: (created as any)?.viewport,
    });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
