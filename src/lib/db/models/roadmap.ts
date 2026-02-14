import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoadmapFolder",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

roadmapSchema.index({ createdBy: 1, order: 1 });
roadmapSchema.index({ createdBy: 1, folderId: 1, order: 1 });

export const Roadmap =
  mongoose.models.Roadmap || mongoose.model("Roadmap", roadmapSchema);
