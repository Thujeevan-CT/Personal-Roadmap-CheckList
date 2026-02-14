import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import {
  Roadmap,
  Module,
  SubModule,
  ChecklistItem,
  Note,
} from "@/lib/db/models";
import { requireSession } from "@/lib/auth/helpers";
import { successResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { serializeDoc, toObjectId } from "@/lib/db/serialize";
import type { ParsedRoadmap } from "@/lib/utils/import-schema";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const data = parseBody<ParsedRoadmap>(body);
    if (!data.title?.trim()) {
      return errorResponse("VALIDATION_ERROR", "title is required", 400);
    }
    if (!Array.isArray(data.modules) || data.modules.length === 0) {
      return errorResponse("VALIDATION_ERROR", "modules array is required", 400);
    }
    if (data.modules.length > 50) {
      return errorResponse("VALIDATION_ERROR", "Maximum 50 modules allowed", 400);
    }
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Roadmap.countDocuments({ createdBy: toObjectId(user.id) });
      const roadmap = await Roadmap.create(
        [
          {
            title: data.title.trim(),
            description: data.description?.trim(),
            icon: data.icon?.trim(),
            status: "active",
            order,
            createdBy: toObjectId(user.id),
          },
        ],
        { session }
      );
      const roadmapId = roadmap[0]._id;
      let moduleOrder = 0;
      for (const mod of data.modules) {
        const [createdModule] = await Module.create(
          [
            {
            roadmapId,
            title: mod.title.trim(),
            description: mod.description?.trim(),
            order: moduleOrder++,
            createdBy: toObjectId(user.id),
          },
          ],
          { session }
        );
        const moduleId = createdModule._id;
        const submodules = mod.submodules ?? [];
        if (submodules.length > 50) {
          throw new Error("Maximum 50 submodules per module");
        }
        let subOrder = 0;
        for (const sub of submodules) {
          const status = ["not_started", "in_progress", "completed", "blocked"].includes(sub.status ?? "")
            ? sub.status
            : "not_started";
          const [createdSub] = await SubModule.create(
            [
              {
                moduleId,
                roadmapId,
                title: sub.title.trim(),
                description: sub.description?.trim(),
                status,
                dueDate: sub.dueDate ? new Date(sub.dueDate) : undefined,
                order: subOrder++,
                createdBy: toObjectId(user.id),
              },
            ],
            { session }
          );
          const subModuleId = createdSub._id;
          const checklist = sub.checklist ?? [];
          if (checklist.length > 100) throw new Error("Max 100 checklist items per submodule");
          for (let i = 0; i < checklist.length; i++) {
            await ChecklistItem.create(
              [
                {
                  subModuleId,
                  roadmapId,
                  title: String(checklist[i]).trim(),
                  isCompleted: false,
                  order: i,
                  createdBy: toObjectId(user.id),
                },
              ],
              { session }
            );
          }
          const notes = sub.notes ?? [];
          if (notes.length > 20) throw new Error("Max 20 notes per submodule");
          for (const content of notes) {
            await Note.create(
              [
                {
                  entityType: "submodule",
                  entityId: subModuleId,
                  roadmapId,
                  content: String(content).trim(),
                  createdBy: toObjectId(user.id),
                },
              ],
              { session }
            );
          }
        }
      }
      await session.commitTransaction();
      const created = await Roadmap.findById(roadmapId).lean();
      return successResponse(serializeDoc(created as any), 201);
    } finally {
      await session.endSession();
    }
  } catch (e: unknown) {
    if (e && typeof e === "object" && "response" in e) return (e as { response: Response }).response;
    return errorResponse("INTERNAL_ERROR", (e as Error).message, 500);
  }
}
