import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    subModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubModule",
      required: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    order: { type: Number, required: true, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

checklistItemSchema.index({ subModuleId: 1, order: 1 });
checklistItemSchema.index({ roadmapId: 1 });
checklistItemSchema.index({ createdBy: 1 });

export const ChecklistItem =
  mongoose.models.ChecklistItem ||
  mongoose.model("ChecklistItem", checklistItemSchema);
