import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Roadmap, Module, SubModule, ChecklistItem, Note } from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { toObjectId } from "@/lib/db/serialize";

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
    }).lean();
    if (!roadmap) return errorResponse("NOT_FOUND", "Roadmap not found", 404);
    const r = roadmap as any;
    const modules = await Module.find({ roadmapId: r._id }).sort({ order: 1 }).lean();
    const moduleIds = modules.map((m: any) => m._id);
    const submodules = await SubModule.find({ moduleId: { $in: moduleIds } })
      .sort({ order: 1 })
      .lean();
    const subModuleIds = submodules.map((s: any) => s._id);
    const checklistItems = await ChecklistItem.find({
      subModuleId: { $in: subModuleIds },
    })
      .sort({ order: 1 })
      .lean();
    const notes = await Note.find({
      entityType: "submodule",
      entityId: { $in: subModuleIds },
      roadmapId: r._id,
    }).lean();

    const subById = new Map(submodules.map((s: any) => [s._id.toString(), s]));
    const out = {
      title: r.title,
      description: r.description,
      icon: r.icon,
      modules: modules.map((m: any) => {
        const modSubs = submodules.filter(
          (s: any) => s.moduleId.toString() === m._id.toString()
        );
        return {
          title: m.title,
          description: m.description,
          submodules: modSubs.map((s: any) => {
            const dueDate = s.dueDate ? new Date(s.dueDate).toISOString().slice(0, 10) : undefined;
            const items = checklistItems.filter(
              (c: any) => c.subModuleId.toString() === s._id.toString()
            );
            const subNotes = notes.filter(
              (n: any) => n.entityId.toString() === s._id.toString()
            );
            return {
              title: s.title,
              description: s.description,
              status: s.status,
              dueDate,
              checklist: items.map((c: any) => c.title),
              notes: subNotes.map((n: any) => n.content),
            };
          }),
        };
      }),
    };
    return successResponse(out);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
