import type {
  Roadmap,
  Module,
  SubModule,
  ChecklistItem,
  Note,
  FileAttachment,
  User,
} from "@/types";

export const mockUser: User = {
  _id: "u1",
  email: "thujeevan@gmail.com",
  name: "Thujeevan",
  image: undefined,
  createdAt: "2025-12-01T00:00:00Z",
};

export const mockRoadmaps: Roadmap[] = [
  {
    _id: "r1",
    title: "Germany Relocation",
    description: "Complete plan for relocating to Berlin, Germany",
    icon: "🇩🇪",
    status: "active",
    order: 0,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-09T14:30:00Z",
  },
  {
    _id: "r2",
    title: "AWS Solutions Architect",
    description: "Prepare and pass the AWS SA Professional certification",
    icon: "☁️",
    status: "active",
    order: 1,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-10T09:00:00Z",
  },
  {
    _id: "r3",
    title: "Startup Launch",
    description: "Launch the MVP for the SaaS product by Q2 2026",
    icon: "🚀",
    status: "active",
    order: 2,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-11T11:00:00Z",
  },
];

export const mockModules: Module[] = [
  {
    _id: "m1",
    roadmapId: "r1",
    title: "Visa & Immigration",
    description: "All visa and legal documentation",
    order: 0,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-09T14:30:00Z",
  },
  {
    _id: "m2",
    roadmapId: "r1",
    title: "Housing",
    description: "Find temporary and permanent housing",
    order: 1,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-05T10:00:00Z",
  },
  {
    _id: "m3",
    roadmapId: "r1",
    title: "Finance & Banking",
    description: "Set up bank accounts and tax registration",
    order: 2,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-28T10:00:00Z",
  },
  {
    _id: "m4",
    roadmapId: "r2",
    title: "Study Plan",
    description: "Structured learning path",
    order: 0,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-10T09:00:00Z",
  },
  {
    _id: "m5",
    roadmapId: "r2",
    title: "Practice Exams",
    description: "Mock tests and review",
    order: 1,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-08T09:00:00Z",
  },
  {
    _id: "m6",
    roadmapId: "r3",
    title: "Product Design",
    description: "UI/UX design and prototyping",
    order: 0,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-11T11:00:00Z",
  },
  {
    _id: "m7",
    roadmapId: "r3",
    title: "Development",
    description: "Core product development",
    order: 1,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-11T11:00:00Z",
  },
  {
    _id: "m8",
    roadmapId: "r3",
    title: "Launch Prep",
    description: "Marketing, landing page, beta users",
    order: 2,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-11T11:00:00Z",
  },
];

export const mockSubModules: SubModule[] = [
  {
    _id: "sm1",
    moduleId: "m1",
    roadmapId: "r1",
    title: "Gather Documents",
    description: "Collect all required legal documents",
    status: "in_progress",
    order: 0,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-09T14:30:00Z",
  },
  {
    _id: "sm2",
    moduleId: "m1",
    roadmapId: "r1",
    title: "Apply for Blue Card",
    status: "not_started",
    dueDate: "2026-04-15",
    order: 1,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    _id: "sm3",
    moduleId: "m1",
    roadmapId: "r1",
    title: "Post-Arrival Registration",
    status: "not_started",
    order: 2,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    _id: "sm4",
    moduleId: "m2",
    roadmapId: "r1",
    title: "Temporary Accommodation",
    status: "completed",
    order: 0,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
  {
    _id: "sm5",
    moduleId: "m2",
    roadmapId: "r1",
    title: "Permanent Apartment",
    status: "in_progress",
    dueDate: "2026-03-30",
    order: 1,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-05T10:00:00Z",
  },
  {
    _id: "sm6",
    moduleId: "m3",
    roadmapId: "r1",
    title: "Open Bank Account",
    status: "not_started",
    order: 0,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    _id: "sm7",
    moduleId: "m3",
    roadmapId: "r1",
    title: "Tax Registration",
    status: "blocked",
    order: 1,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-28T10:00:00Z",
  },
  {
    _id: "sm8",
    moduleId: "m4",
    roadmapId: "r2",
    title: "Networking Fundamentals",
    status: "completed",
    order: 0,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-05T09:00:00Z",
  },
  {
    _id: "sm9",
    moduleId: "m4",
    roadmapId: "r2",
    title: "Compute & Storage",
    status: "in_progress",
    order: 1,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-10T09:00:00Z",
  },
  {
    _id: "sm10",
    moduleId: "m4",
    roadmapId: "r2",
    title: "Security & IAM",
    status: "not_started",
    order: 2,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-01-20T08:00:00Z",
  },
  {
    _id: "sm11",
    moduleId: "m5",
    roadmapId: "r2",
    title: "Practice Test 1",
    status: "completed",
    order: 0,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-08T09:00:00Z",
  },
  {
    _id: "sm12",
    moduleId: "m5",
    roadmapId: "r2",
    title: "Practice Test 2",
    status: "not_started",
    order: 1,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-01-20T08:00:00Z",
  },
  {
    _id: "sm13",
    moduleId: "m6",
    roadmapId: "r3",
    title: "User Research",
    status: "completed",
    order: 0,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-08T11:00:00Z",
  },
  {
    _id: "sm14",
    moduleId: "m6",
    roadmapId: "r3",
    title: "Wireframes & Mockups",
    status: "in_progress",
    order: 1,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-11T11:00:00Z",
  },
  {
    _id: "sm15",
    moduleId: "m7",
    roadmapId: "r3",
    title: "Backend API",
    status: "not_started",
    order: 0,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-01T12:00:00Z",
  },
  {
    _id: "sm16",
    moduleId: "m7",
    roadmapId: "r3",
    title: "Frontend App",
    status: "not_started",
    order: 1,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-01T12:00:00Z",
  },
  {
    _id: "sm17",
    moduleId: "m8",
    roadmapId: "r3",
    title: "Landing Page",
    status: "not_started",
    order: 0,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-01T12:00:00Z",
  },
  {
    _id: "sm18",
    moduleId: "m8",
    roadmapId: "r3",
    title: "Beta User Outreach",
    status: "not_started",
    order: 1,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-01T12:00:00Z",
  },
];

export const mockChecklistItems: ChecklistItem[] = [
  { _id: "cl1", subModuleId: "sm1", roadmapId: "r1", title: "Birth certificate apostilled", isCompleted: true, order: 0, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-02-01T10:00:00Z" },
  { _id: "cl2", subModuleId: "sm1", roadmapId: "r1", title: "Passport renewed", isCompleted: true, order: 1, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-28T10:00:00Z" },
  { _id: "cl3", subModuleId: "sm1", roadmapId: "r1", title: "University transcripts translated", isCompleted: false, order: 2, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl4", subModuleId: "sm1", roadmapId: "r1", title: "Employment contract signed", isCompleted: false, order: 3, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl5", subModuleId: "sm2", roadmapId: "r1", title: "Fill application form", isCompleted: false, order: 0, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl6", subModuleId: "sm2", roadmapId: "r1", title: "Book embassy appointment", isCompleted: false, order: 1, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl7", subModuleId: "sm2", roadmapId: "r1", title: "Prepare biometric photo", isCompleted: false, order: 2, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl8", subModuleId: "sm4", roadmapId: "r1", title: "Book Airbnb for first 2 weeks", isCompleted: true, order: 0, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-25T10:00:00Z" },
  { _id: "cl9", subModuleId: "sm4", roadmapId: "r1", title: "Research co-living options", isCompleted: true, order: 1, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-02-01T10:00:00Z" },
  { _id: "cl10", subModuleId: "sm5", roadmapId: "r1", title: "Create Immobilienscout24 account", isCompleted: true, order: 0, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-02-03T10:00:00Z" },
  { _id: "cl11", subModuleId: "sm5", roadmapId: "r1", title: "Prepare SCHUFA documents", isCompleted: false, order: 1, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl12", subModuleId: "sm5", roadmapId: "r1", title: "Schedule apartment viewings", isCompleted: false, order: 2, createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-16T10:00:00Z" },
  { _id: "cl13", subModuleId: "sm8", roadmapId: "r2", title: "Complete VPC module", isCompleted: true, order: 0, createdAt: "2026-01-22T08:00:00Z", updatedAt: "2026-02-01T08:00:00Z" },
  { _id: "cl14", subModuleId: "sm8", roadmapId: "r2", title: "Complete Route 53 module", isCompleted: true, order: 1, createdAt: "2026-01-22T08:00:00Z", updatedAt: "2026-02-05T08:00:00Z" },
  { _id: "cl15", subModuleId: "sm9", roadmapId: "r2", title: "EC2 deep dive", isCompleted: true, order: 0, createdAt: "2026-01-22T08:00:00Z", updatedAt: "2026-02-08T08:00:00Z" },
  { _id: "cl16", subModuleId: "sm9", roadmapId: "r2", title: "S3 & Glacier", isCompleted: false, order: 1, createdAt: "2026-01-22T08:00:00Z", updatedAt: "2026-01-22T08:00:00Z" },
  { _id: "cl17", subModuleId: "sm9", roadmapId: "r2", title: "EBS & EFS", isCompleted: false, order: 2, createdAt: "2026-01-22T08:00:00Z", updatedAt: "2026-01-22T08:00:00Z" },
  { _id: "cl18", subModuleId: "sm11", roadmapId: "r2", title: "Complete practice test", isCompleted: true, order: 0, createdAt: "2026-02-06T08:00:00Z", updatedAt: "2026-02-07T08:00:00Z" },
  { _id: "cl19", subModuleId: "sm11", roadmapId: "r2", title: "Review wrong answers", isCompleted: true, order: 1, createdAt: "2026-02-06T08:00:00Z", updatedAt: "2026-02-08T08:00:00Z" },
  { _id: "cl20", subModuleId: "sm13", roadmapId: "r3", title: "Interview 5 potential users", isCompleted: true, order: 0, createdAt: "2026-02-02T12:00:00Z", updatedAt: "2026-02-06T12:00:00Z" },
  { _id: "cl21", subModuleId: "sm13", roadmapId: "r3", title: "Compile research findings", isCompleted: true, order: 1, createdAt: "2026-02-02T12:00:00Z", updatedAt: "2026-02-08T12:00:00Z" },
  { _id: "cl22", subModuleId: "sm14", roadmapId: "r3", title: "Create low-fi wireframes", isCompleted: true, order: 0, createdAt: "2026-02-09T12:00:00Z", updatedAt: "2026-02-10T12:00:00Z" },
  { _id: "cl23", subModuleId: "sm14", roadmapId: "r3", title: "Design high-fi mockups", isCompleted: false, order: 1, createdAt: "2026-02-09T12:00:00Z", updatedAt: "2026-02-09T12:00:00Z" },
  { _id: "cl24", subModuleId: "sm14", roadmapId: "r3", title: "Create interactive prototype", isCompleted: false, order: 2, createdAt: "2026-02-09T12:00:00Z", updatedAt: "2026-02-09T12:00:00Z" },
];

export const mockNotes: Note[] = [
  { _id: "n1", entityType: "submodule", entityId: "sm1", roadmapId: "r1", content: "Apostille office hours: Mon-Fri 9am-3pm. Appointment required via online portal.", createdAt: "2026-01-20T10:00:00Z", updatedAt: "2026-01-20T10:00:00Z" },
  { _id: "n2", entityType: "submodule", entityId: "sm2", roadmapId: "r1", content: "Embassy appointment slots open 6 weeks in advance. Check every Monday at 8am.", createdAt: "2026-01-22T10:00:00Z", updatedAt: "2026-01-22T10:00:00Z" },
  { _id: "n3", entityType: "roadmap", entityId: "r1", roadmapId: "r1", content: "Target arrival date: May 2026. Budget: €5,000 for relocation costs.", createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-01-15T10:00:00Z" },
];

export const mockFiles: FileAttachment[] = [
  { _id: "f1", subModuleId: "sm1", roadmapId: "r1", fileName: "passport_scan.pdf", fileKey: "files/u1/r1/sm1/uuid1_passport_scan.pdf", fileSize: 245000, mimeType: "application/pdf", createdAt: "2026-01-25T10:00:00Z" },
  { _id: "f2", subModuleId: "sm1", roadmapId: "r1", fileName: "birth_certificate.pdf", fileKey: "files/u1/r1/sm1/uuid2_birth_certificate.pdf", fileSize: 180000, mimeType: "application/pdf", createdAt: "2026-01-26T10:00:00Z" },
];

export function getModulesForRoadmap(roadmapId: string): Module[] {
  return mockModules.filter((m) => m.roadmapId === roadmapId).sort((a, b) => a.order - b.order);
}

export function getSubModulesForModule(moduleId: string): SubModule[] {
  return mockSubModules.filter((sm) => sm.moduleId === moduleId).sort((a, b) => a.order - b.order);
}

export function getChecklistForSubModule(subModuleId: string): ChecklistItem[] {
  return mockChecklistItems.filter((cl) => cl.subModuleId === subModuleId).sort((a, b) => a.order - b.order);
}

export function getNotesForEntity(entityType: string, entityId: string): Note[] {
  return mockNotes.filter((n) => n.entityType === entityType && n.entityId === entityId);
}

export function getFilesForSubModule(subModuleId: string): FileAttachment[] {
  return mockFiles.filter((f) => f.subModuleId === subModuleId);
}

export function getSubModuleProgress(subModuleId: string): number {
  const items = getChecklistForSubModule(subModuleId);
  if (items.length === 0) return 0;
  const completed = items.filter((i) => i.isCompleted).length;
  return Math.round((completed / items.length) * 100);
}

export function getModuleProgress(moduleId: string): number {
  const subs = getSubModulesForModule(moduleId);
  if (subs.length === 0) return 0;
  const total = subs.reduce((acc, sm) => acc + getSubModuleProgress(sm._id), 0);
  return Math.round(total / subs.length);
}

export function getRoadmapProgress(roadmapId: string): number {
  const modules = getModulesForRoadmap(roadmapId);
  if (modules.length === 0) return 0;
  const total = modules.reduce((acc, m) => acc + getModuleProgress(m._id), 0);
  return Math.round(total / modules.length);
}

export { getRelativeTime } from "@/lib/utils/date";
