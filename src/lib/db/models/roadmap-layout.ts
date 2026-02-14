import mongoose from "mongoose";

const nodePositionSchema = new mongoose.Schema(
  {
    entityId: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["roadmap", "module", "submodule"],
      required: true,
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const edgeDefinitionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, enum: ["default", "step", "smoothstep"] },
    label: { type: String },
  },
  { _id: false }
);

const viewportSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    zoom: { type: Number, required: true },
  },
  { _id: false }
);

const roadmapLayoutSchema = new mongoose.Schema(
  {
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
      unique: true,
    },
    nodes: [nodePositionSchema],
    edges: [edgeDefinitionSchema],
    viewport: viewportSchema,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

roadmapLayoutSchema.index({ roadmapId: 1 }, { unique: true });
roadmapLayoutSchema.index({ createdBy: 1 });

export const RoadmapLayout =
  mongoose.models.RoadmapLayout ||
  mongoose.model("RoadmapLayout", roadmapLayoutSchema);
