import mongoose from "mongoose";

const submoduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "blocked"],
      default: "not_started",
    },
    dueDate: { type: Date },
    order: { type: Number, required: true, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

submoduleSchema.index({ moduleId: 1, order: 1 });
submoduleSchema.index({ roadmapId: 1 });
submoduleSchema.index({ createdBy: 1 });

export const SubModule =
  mongoose.models.SubModule || mongoose.model("SubModule", submoduleSchema);
