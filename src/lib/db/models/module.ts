import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

moduleSchema.index({ roadmapId: 1, order: 1 });
moduleSchema.index({ createdBy: 1 });

export const Module =
  mongoose.models.Module || mongoose.model("Module", moduleSchema);
