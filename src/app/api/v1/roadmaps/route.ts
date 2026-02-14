import type { Types } from "mongoose";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Roadmap, Module, SubModule, ChecklistItem, RoadmapFolder } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";
import { getRoadmapProgress } from "@/lib/utils/progress";
import type { Module as ModuleType, SubModule as SubModuleType, ChecklistItem as ChecklistItemType } from "@/types";

type LeanDoc = { _id: Types.ObjectId; [key: string]: unknown };
type LeanModule = LeanDoc & { roadmapId: Types.ObjectId };
type LeanSubModule = LeanDoc & { moduleId: Types.ObjectId; roadmapId: Types.ObjectId };
type LeanChecklistItem = LeanDoc & { subModuleId: Types.ObjectId; roadmapId: Types.ObjectId };

export async function GET() {
  try {
    const user = await requireSession();
    await connectDB();
    const roadmaps = await Roadmap.find({ createdBy: toObjectId(user.id) })
      .sort({ order: 1 })
      .lean();
    if (roadmaps.length === 0) {
      return successResponse(
        (roadmaps as any[]).map((r) => ({ ...serializeDoc(r), progress: 0 }))
      );
    }
    const roadmapIds = roadmaps.map((r) => r._id);
    const modulesRaw = await Module.find({ roadmapId: { $in: roadmapIds } }).lean();
    const modules = modulesRaw as LeanModule[];
    const moduleIds = modules.map((m) => m._id);
    const submodulesRaw = await SubModule.find({ moduleId: { $in: moduleIds } }).lean();
    const submodules = submodulesRaw as LeanSubModule[];
    const subModuleIds = submodules.map((s) => s._id);
    const checklistItemsRaw = await ChecklistItem.find({
      subModuleId: { $in: subModuleIds },
    }).lean();
    const checklistItems = checklistItemsRaw as LeanChecklistItem[];
    const mods = modules.map((m) => ({
      ...m,
      _id: m._id.toString(),
      roadmapId: m.roadmapId.toString(),
    })) as ModuleType[];
    const subs = submodules.map((s) => ({
      ...s,
      _id: s._id.toString(),
      moduleId: s.moduleId.toString(),
      roadmapId: s.roadmapId.toString(),
    })) as SubModuleType[];
    const items = checklistItems.map((c) => ({
      ...c,
      _id: c._id.toString(),
      subModuleId: c.subModuleId.toString(),
      roadmapId: c.roadmapId.toString(),
    })) as ChecklistItemType[];
    const list = (roadmaps as any[]).map((r) => {
      const ser = serializeDoc(r);
      const progress = getRoadmapProgress(mods, subs, items, r._id.toString());
      return { ...ser, progress };
    });
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
    const { title, description, icon, status, folderId } = parseBody<{
      title: string;
      description?: string;
      icon?: string;
      status?: string;
      folderId?: string | null;
    }>(body);
    if (!title || typeof title !== "string" || !title.trim()) {
      return errorResponse("VALIDATION_ERROR", "title is required", 400);
    }
    await connectDB();

    let folder: any | null = null;
    if (folderId) {
      folder = await RoadmapFolder.findOne({
        _id: toObjectId(folderId),
        createdBy: toObjectId(user.id),
      });
      if (!folder) {
        return errorResponse("FORBIDDEN", "Folder not found", 403);
      }
    }
    const count = await Roadmap.countDocuments({ createdBy: toObjectId(user.id) });
    const roadmap = await Roadmap.create({
      title: title.trim(),
      description: description?.trim(),
      icon: icon?.trim(),
      ...(folderId !== undefined && { folderId: folder?._id ?? null }),
      status: status === "completed" || status === "archived" ? status : "active",
      order: count,
      createdBy: toObjectId(user.id),
    });
    return successResponse(serializeDoc(roadmap), 201);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
