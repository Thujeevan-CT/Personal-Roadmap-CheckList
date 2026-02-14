import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
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
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

fileSchema.index({ subModuleId: 1 });
fileSchema.index({ roadmapId: 1 });
fileSchema.index({ uploadedBy: 1 });

export const FileAttachment =
  mongoose.models.FileAttachment ||
  mongoose.model("FileAttachment", fileSchema);
