export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: string;
}

export interface Roadmap {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  status: "active" | "completed" | "archived";
  order: number;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  _id: string;
  roadmapId: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubModule {
  _id: string;
  moduleId: string;
  roadmapId: string;
  title: string;
  description?: string;
  status: "not_started" | "in_progress" | "completed" | "blocked";
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  subModuleId: string;
  roadmapId: string;
  title: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  entityType: "roadmap" | "module" | "submodule";
  entityId: string;
  roadmapId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  _id: string;
  subModuleId: string;
  roadmapId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface NodePosition {
  entityId: string;
  entityType: "roadmap" | "module" | "submodule";
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface EdgeDefinition {
  id: string;
  source: string;
  target: string;
  type?: "default" | "step" | "smoothstep";
  label?: string;
}

export interface RoadmapLayout {
  _id: string;
  roadmapId: string;
  nodes: NodePosition[];
  edges: EdgeDefinition[];
  viewport?: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
}

export type SubModuleStatus = SubModule["status"];
export type RoadmapStatus = Roadmap["status"];
