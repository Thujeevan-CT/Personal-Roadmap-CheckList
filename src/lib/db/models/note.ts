import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["roadmap", "module", "submodule"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    content: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

noteSchema.index({ entityType: 1, entityId: 1 });
noteSchema.index({ roadmapId: 1 });
noteSchema.index({ createdBy: 1 });

export const Note =
  mongoose.models.Note || mongoose.model("Note", noteSchema);
