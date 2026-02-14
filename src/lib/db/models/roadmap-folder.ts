import mongoose from "mongoose";

const roadmapFolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

roadmapFolderSchema.index({ createdBy: 1, order: 1 });

export const RoadmapFolder =
  mongoose.models.RoadmapFolder ||
  mongoose.model("RoadmapFolder", roadmapFolderSchema);

