import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connection";
import {
  Roadmap,
  Module,
  SubModule,
  ChecklistItem,
  Note,
  FileAttachment,
  RoadmapLayout,
} from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";
import { getRoadmapProgress, getModuleProgress, getSubModuleProgress } from "@/lib/utils/progress";

async function getRoadmapWithProgress(id: string, userId: string) {
  const roadmap = await Roadmap.findOne({
    _id: toObjectId(id),
    createdBy: toObjectId(userId),
  }).lean();
  if (!roadmap) return null;
  const r = roadmap as Record<string, unknown>;
  const modules = await Module.find({ roadmapId: r._id })
    .sort({ order: 1 })
    .lean();
  const moduleIds = modules.map((m) => (m as any)._id);
  const submodules = await SubModule.find({ moduleId: { $in: moduleIds } })
    .sort({ order: 1 })
    .lean();
  const subModuleIds = submodules.map((s) => (s as any)._id);
  const checklistItems = await ChecklistItem.find({
    subModuleId: { $in: subModuleIds },
  })
    .sort({ order: 1 })
    .lean();
  const mods = modules.map((m) => ({
    _id: (m as any)._id.toString(),
    roadmapId: (m as any).roadmapId.toString(),
    title: (m as any).title,
    description: (m as any).description,
    order: (m as any).order,
    createdAt: (m as any).createdAt,
    updatedAt: (m as any).updatedAt,
  }));
  const subs = submodules.map((s) => ({
    _id: (s as any)._id.toString(),
    moduleId: (s as any).moduleId.toString(),
    roadmapId: (s as any).roadmapId.toString(),
    title: (s as any).title,
    description: (s as any).description,
    status: (s as any).status,
    dueDate: (s as any).dueDate,
    order: (s as any).order,
    createdAt: (s as any).createdAt,
    updatedAt: (s as any).updatedAt,
  }));
  const items = checklistItems.map((c) => ({
    _id: (c as any)._id.toString(),
    subModuleId: (c as any).subModuleId.toString(),
    roadmapId: (c as any).roadmapId.toString(),
    title: (c as any).title,
    isCompleted: (c as any).isCompleted,
    order: (c as any).order,
    createdAt: (c as any).createdAt,
    updatedAt: (c as any).updatedAt,
  }));
  const progress = getRoadmapProgress(mods, subs, items, (r._id as any).toString());
  const modulesWithChildren = mods.map((mod) => {
    const moduleSubs = subs
      .filter((s) => s.moduleId === mod._id)
      .map((s) => ({ ...s, progress: getSubModuleProgress(items, s._id) }));
    const moduleProgress = getModuleProgress(subs, items, mod._id);
    return {
      ...mod,
      submodules: moduleSubs,
      progress: moduleProgress,
    };
  });
  return { roadmap, modules: modulesWithChildren, progress };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    await connectDB();
    const data = await getRoadmapWithProgress(id, user.id);
    if (!data) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    const roadmapOut = {
      ...serializeDoc(data.roadmap as any),
      progress: data.progress,
    };
    const modulesOut = (data.modules as any[]).map((m) => ({
      ...serializeDoc(m),
      submodules: (m.submodules || []).map((s: any) => serializeDoc(s)),
      progress: m.progress ?? 0,
    }));
    return successResponse({
      roadmap: roadmapOut,
      modules: modulesOut,
    });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { title, description, icon, status, folderId } = body as {
      title?: string;
      description?: string;
      icon?: string;
      status?: string;
      folderId?: string | null;
    };
    await connectDB();
    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: toObjectId(id), createdBy: toObjectId(user.id) },
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(icon !== undefined && { icon: icon?.trim() }),
        ...(status !== undefined &&
          ["active", "completed", "archived"].includes(status) && { status }),
        ...(folderId !== undefined && { folderId: folderId ? toObjectId(folderId) : null }),
      },
      { new: true }
    );
    if (!roadmap) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    return successResponse(serializeDoc(roadmap));
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    const { id } = await params;
    const oid = toObjectId(id);
    await connectDB();
    const roadmap = await Roadmap.findOne({
      _id: oid,
      createdBy: toObjectId(user.id),
    });
    if (!roadmap) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    const moduleIds = (await Module.find({ roadmapId: oid }).distinct("_id")) as mongoose.Types.ObjectId[];
    const subModuleIds = (await SubModule.find({ moduleId: { $in: moduleIds } }).distinct("_id")) as mongoose.Types.ObjectId[];
    await ChecklistItem.deleteMany({ subModuleId: { $in: subModuleIds } });
    await Note.deleteMany({ roadmapId: oid });
    await FileAttachment.deleteMany({ roadmapId: oid });
    await RoadmapLayout.deleteOne({ roadmapId: oid });
    await SubModule.deleteMany({ moduleId: { $in: moduleIds } });
    await Module.deleteMany({ roadmapId: oid });
    await Roadmap.deleteOne({ _id: oid });
    return successResponse({ deleted: true });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}