# MyFlow — Product Requirements Document

> **Version:** 1.1
> **Last Updated:** 2026-02-11
> **Status:** Draft
> **Author:** Thujeevan

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Core Philosophy](#2-core-philosophy)
3. [User Personas](#3-user-personas)
4. [Information Architecture](#4-information-architecture)
5. [Data Model](#5-data-model)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Tech Stack](#8-tech-stack)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [API Design](#10-api-design)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [File Storage](#12-file-storage)
13. [Project Structure](#13-project-structure)
14. [Implementation Phases](#14-implementation-phases)
15. [Risk & Mitigations](#15-risk--mitigations)

---

## 1. Product Vision

**MyFlow** is a structured roadmap management system that allows a single user to create hierarchical execution plans (e.g., "Germany Relocation"), visualize them as interactive node-based flowcharts (inspired by roadmap.sh), track progress via checklists, attach notes and documents, and centralize execution knowledge.

### Primary Use Cases

- Personal life planning (relocation, immigration, career transitions)
- Structured execution of multi-stage goals (certifications, startup launches)

### Future Possibility (Out of Scope for v1)

- SaaS product for relocation, immigration, certification, and startup planning roadmaps
- Multi-tenant architecture with team collaboration

---

## 2. Core Philosophy

### This IS

- A **structured goal execution tracker**
- A **hierarchical checklist + documentation system**
- A **visual roadmap builder** with interactive flowchart previews
- A focused, narrow-scope tool that does one thing well

### This is NOT

- A Notion clone
- A ClickUp clone
- A document management system
- A collaboration tool

### Design Principles

| Principle | Description |
|---|---|
| **Narrow Focus** | Only roadmap execution. No wikis, no databases, no calendar views. |
| **Hierarchy First** | Everything is `Roadmap > Module > SubModule > Checklist`. No flat lists. |
| **Progress Visibility** | Every level shows aggregated completion percentage at a glance. |
| **Speed** | < 1s initial load. Optimistic UI updates. Minimal network roundtrips. |
| **Simplicity** | Every feature must justify its existence. When in doubt, leave it out. |

---

## 3. User Personas

### Primary User: The Planner (You)

- Single authenticated user (Google OAuth)
- Creates complex multi-stage plans
- Needs to track progress across dozens of items
- Attaches reference documents and notes to specific tasks
- Accesses primarily from desktop, occasionally mobile

---

## 4. Information Architecture

```
MyFlow
├── Dashboard (list of all Roadmaps with progress)
│
├── Roadmap: "Germany Relocation"
│   ├── Overview (progress %, description, notes)
│   │
│   ├── Module: "Visa & Immigration"
│   │   ├── SubModule: "Gather Documents"
│   │   │   ├── Checklist: [ ] Birth certificate apostilled
│   │   │   ├── Checklist: [x] Passport renewed
│   │   │   ├── Checklist: [ ] University transcripts
│   │   │   ├── Notes: "Apostille office hours: Mon-Fri 9-3"
│   │   │   └── Files: apostille_receipt.pdf
│   │   │
│   │   ├── SubModule: "Apply for Blue Card"
│   │   │   ├── Checklist: [ ] Fill application form
│   │   │   ├── Checklist: [ ] Book embassy appointment
│   │   │   └── Notes: "Embassy link: ..."
│   │   │
│   │   └── SubModule: "Post-Arrival Registration"
│   │       └── ...
│   │
│   ├── Module: "Housing"
│   │   ├── SubModule: "Temporary Housing"
│   │   └── SubModule: "Permanent Apartment"
│   │
│   └── Module: "Finance"
│       ├── SubModule: "Open Bank Account"
│       └── SubModule: "Tax Registration"
│
└── Roadmap: "AWS Certification"
    └── ...
```

### Entity Hierarchy

```
Roadmap (top-level goal)
  └── Module (major phase / category)
       └── SubModule (specific task group)
            ├── ChecklistItem (actionable item)
            ├── Note (rich text documentation)
            └── File (attached document)
```

### Progress Calculation

- **SubModule progress** = `completed checklist items / total checklist items` (0% if no items)
- **Module progress** = average of all SubModule progresses
- **Roadmap progress** = average of all Module progresses

---

## 5. Data Model

### 5.1 User

```typescript
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  image?: string;       // Google profile image
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Roadmap

```typescript
interface Roadmap {
  _id: ObjectId;
  title: string;            // e.g., "Germany Relocation"
  description?: string;     // brief summary
  icon?: string;            // emoji or icon identifier
  createdBy: ObjectId;      // ref: User
  status: 'active' | 'completed' | 'archived';
  order: number;            // for ordering on dashboard
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3 Module

```typescript
interface Module {
  _id: ObjectId;
  roadmapId: ObjectId;     // ref: Roadmap
  title: string;            // e.g., "Visa & Immigration"
  description?: string;
  order: number;            // position within roadmap
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.4 SubModule

```typescript
interface SubModule {
  _id: ObjectId;
  moduleId: ObjectId;       // ref: Module
  roadmapId: ObjectId;      // denormalized for query efficiency
  title: string;            // e.g., "Gather Documents"
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: Date;
  order: number;            // position within module
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.5 ChecklistItem

```typescript
interface ChecklistItem {
  _id: ObjectId;
  subModuleId: ObjectId;    // ref: SubModule
  roadmapId: ObjectId;      // denormalized
  title: string;            // e.g., "Birth certificate apostilled"
  isCompleted: boolean;
  order: number;            // position within submodule
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.6 Note

```typescript
interface Note {
  _id: ObjectId;
  entityType: 'roadmap' | 'module' | 'submodule';
  entityId: ObjectId;       // polymorphic ref
  roadmapId: ObjectId;      // denormalized
  content: string;          // HTML or Markdown from TipTap
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.7 File

```typescript
interface FileAttachment {
  _id: ObjectId;
  subModuleId: ObjectId;    // ref: SubModule
  roadmapId: ObjectId;      // denormalized
  fileName: string;         // original file name
  fileKey: string;          // S3 object key
  fileSize: number;         // bytes
  mimeType: string;
  uploadedBy: ObjectId;
  createdAt: Date;
}
```

### 5.8 RoadmapLayout

```typescript
interface RoadmapLayout {
  _id: ObjectId;
  roadmapId: ObjectId;        // ref: Roadmap (1:1 relationship)
  nodes: NodePosition[];
  edges: EdgeDefinition[];
  viewport?: {                 // last saved viewport state
    x: number;
    y: number;
    zoom: number;
  };
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface NodePosition {
  entityId: string;            // Module or SubModule _id (or roadmapId for root)
  entityType: 'roadmap' | 'module' | 'submodule';
  position: { x: number; y: number };
  width?: number;              // optional custom node width
  height?: number;             // optional custom node height
}

interface EdgeDefinition {
  id: string;
  source: string;              // source entityId
  target: string;              // target entityId
  type?: 'default' | 'step' | 'smoothstep';
  label?: string;
}
```

### 5.9 MongoDB Indexes

```javascript
// Users
{ email: 1 }                          // unique
{ googleId: 1 }                       // unique

// Roadmaps
{ createdBy: 1, order: 1 }

// Modules
{ roadmapId: 1, order: 1 }
{ createdBy: 1 }

// SubModules
{ moduleId: 1, order: 1 }
{ roadmapId: 1 }
{ createdBy: 1 }

// ChecklistItems
{ subModuleId: 1, order: 1 }
{ roadmapId: 1 }
{ createdBy: 1 }

// Notes
{ entityType: 1, entityId: 1 }
{ roadmapId: 1 }
{ createdBy: 1 }

// FileAttachments
{ subModuleId: 1 }
{ roadmapId: 1 }
{ createdBy: 1 }

// RoadmapLayouts
{ roadmapId: 1 }              // unique
{ createdBy: 1 }
```

---

## 6. Functional Requirements

### 6.1 Roadmap Management

| ID | Requirement | Priority | Details |
|---|---|---|---|
| RM-01 | Create roadmap | P0 | Title (required), description (optional), icon (optional) |
| RM-02 | Edit roadmap | P0 | Inline edit title/description, change icon |
| RM-03 | Delete roadmap | P0 | Soft confirmation dialog. Cascades delete to all children (modules, submodules, checklist items, notes, files) |
| RM-04 | View dashboard | P0 | Card grid showing all roadmaps with title, icon, overall progress %, status badge, last updated |
| RM-05 | View roadmap detail | P0 | Shows all modules with individual progress bars |
| RM-06 | Archive roadmap | P1 | Move to archived state, hidden from main dashboard by default |
| RM-07 | Reorder roadmaps | P2 | Drag to reorder on dashboard |
| RM-08 | Import roadmap from JSON | P0 | Paste JSON text or upload a `.json` file to bulk-create a roadmap with all modules, submodules, and checklist items in one action. Validates against the import schema. |
| RM-09 | Export roadmap as JSON | P1 | Export a full roadmap (with all children) as a downloadable `.json` file matching the import schema. |

### 6.2 Module Management

| ID | Requirement | Priority | Details |
|---|---|---|---|
| MO-01 | Add module | P0 | Title (required). Created at end of list by default. |
| MO-02 | Edit module | P0 | Inline edit title and description |
| MO-03 | Delete module | P0 | Confirmation dialog. Cascades delete to submodules, checklist items, notes, files. |
| MO-04 | View module detail | P0 | Expands to show submodules with progress |
| MO-05 | Drag and reorder | P0 | Drag handle on each module card. Updates `order` field. |

### 6.3 SubModule Management

| ID | Requirement | Priority | Details |
|---|---|---|---|
| SM-01 | Add submodule | P0 | Title (required). Appended to parent module. |
| SM-02 | Edit submodule | P0 | Title, description, status, due date |
| SM-03 | Update status | P0 | Dropdown: not_started, in_progress, completed, blocked |
| SM-04 | Set due date | P1 | Date picker. Visual indicator when overdue. |
| SM-05 | Delete submodule | P0 | Confirmation. Cascades to checklist items, notes, files. |
| SM-06 | Reorder submodules | P0 | Drag within parent module |

### 6.4 Checklist Management

| ID | Requirement | Priority | Details |
|---|---|---|---|
| CL-01 | Add checklist item | P0 | Text input. Enter to add, auto-focus for rapid entry. |
| CL-02 | Toggle complete | P0 | Checkbox click. Optimistic UI update. |
| CL-03 | Edit checklist item | P0 | Inline text edit on click |
| CL-04 | Delete checklist item | P0 | Icon button, no confirmation needed |
| CL-05 | Reorder checklist | P1 | Drag to reorder within submodule |
| CL-06 | Auto progress | P0 | SubModule progress auto-recalculates on every toggle/add/delete |

### 6.5 Notes

| ID | Requirement | Priority | Details |
|---|---|---|---|
| NT-01 | Add note | P0 | Rich text editor (TipTap). Can attach to roadmap, module, or submodule. |
| NT-02 | Edit note | P0 | Open editor with existing content. Auto-save on blur or manual save. |
| NT-03 | Delete note | P0 | Confirmation dialog |
| NT-04 | View notes | P0 | Listed within entity detail view |

**TipTap Editor Features (Minimal Set):**

- Bold, italic, strikethrough
- Headings (H1-H3)
- Bullet list, ordered list
- Code block
- Link insertion
- Blockquote

### 6.6 File Upload

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FU-01 | Upload file | P1 | Drag-and-drop or click-to-upload. Max 10MB per file. Attached to submodule only. |
| FU-02 | List files | P1 | Show file name, size, upload date within submodule view |
| FU-03 | Download file | P1 | Signed URL redirect (time-limited) |
| FU-04 | Delete file | P1 | Confirmation. Deletes from S3 + DB. |

**Supported file types:** PDF, images (png/jpg/webp), documents (doc/docx), spreadsheets (xls/xlsx), text files.

### 6.7 Visual Roadmap Preview

| ID | Requirement | Priority | Details |
|---|---|---|---|
| VP-01 | View roadmap as flowchart | P0 | Node-based visual graph showing Modules and SubModules as connected nodes (similar to roadmap.sh). Accessible from roadmap detail page via a "Visual" tab/toggle. |
| VP-02 | Node status coloring | P0 | Nodes color-coded by status: not_started (gray), in_progress (amber), completed (green), blocked (red). Module nodes show aggregated progress. |
| VP-03 | Lock mode (default) | P0 | Read-only canvas. Pan and zoom only. Click a SubModule node to open its detail panel. Click a Module node to show inline summary. No structural edits. |
| VP-04 | Quick status toggle (Lock Mode) | P0 | Right-click or long-press a SubModule node to open a context menu for quick status change. |
| VP-05 | Pan and zoom | P0 | Mouse wheel zoom, click-and-drag pan, pinch zoom on touch. Minimap in bottom-right corner. |
| VP-06 | Progress overlay | P1 | Each Module node shows a small progress bar or percentage inside. Roadmap overall progress shown in canvas header. |
| VP-07 | Fit-to-view | P1 | Button to auto-fit all nodes into the visible viewport. |
| VP-08 | Lock/Edit mode toggle | P0 | Toggle button switches between Lock mode (read-only) and Edit mode (structural changes). Default: Lock mode. |

### 6.8 Visual Roadmap Editor

| ID | Requirement | Priority | Details |
|---|---|---|---|
| VE-01 | Dedicated editor page | P0 | Full-screen editor at `/roadmap/:id/editor`. No sidebar — full canvas area. Top toolbar only. |
| VE-02 | Add node | P0 | Add Module or SubModule nodes via toolbar button or by double-clicking empty canvas. Node type selected from a small popup. |
| VE-03 | Delete node | P0 | Select node + Delete key, or right-click context menu. Confirmation dialog. Deletes the underlying entity from the database. |
| VE-04 | Move node | P0 | Free-form drag nodes to reposition on the canvas. Position persisted to RoadmapLayout on save. |
| VE-05 | Connect nodes | P0 | Drag from a node's source handle to another node's target handle to create an edge. Edges represent hierarchy (Module → SubModule). |
| VE-06 | Delete edge | P0 | Click edge to select, then Delete key or right-click "Remove". |
| VE-07 | Edit node inline | P0 | Double-click a node label to edit title inline. Press Enter to save. |
| VE-08 | Auto-layout | P1 | Toolbar button to auto-arrange all nodes in a clean top-down tree layout using dagre/elkjs algorithm. |
| VE-09 | Save layout | P0 | Explicit "Save" button in toolbar. Also auto-saves every 30 seconds if layout is dirty. Visual save-status indicator. |
| VE-10 | Editor toolbar | P0 | Top bar: Back to roadmap, Save status, Auto-layout, Zoom in/out/fit, Undo/Redo, Lock/Edit toggle. |
| VE-11 | Undo/Redo | P1 | Track node move, add, delete, edge add/delete. Stack-based undo up to 50 steps. |
| VE-12 | Node resize | P2 | Drag node edges to resize. Optional for v1. |

### 6.9 JSON Import / Export

The primary workflow: User generates a roadmap structure using an AI tool (ChatGPT, Gemini, Claude, etc.) in MyFlow's JSON format, then imports it to instantly create a fully populated roadmap.

#### Import Schema

```typescript
interface RoadmapImport {
  title: string;                    // required, 1-200 chars
  description?: string;             // optional, max 1000 chars
  icon?: string;                    // optional, single emoji
  modules: ModuleImport[];          // required, at least 1
}

interface ModuleImport {
  title: string;                    // required, 1-200 chars
  description?: string;
  submodules?: SubModuleImport[];   // optional
}

interface SubModuleImport {
  title: string;                    // required, 1-200 chars
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';  // default: not_started
  dueDate?: string;                 // ISO 8601 date string, optional
  checklist?: string[];             // array of checklist item titles, optional
  notes?: string[];                 // array of plain text or markdown notes, optional
}
```

#### JSON Example (for AI prompt reference)

```json
{
  "title": "Germany Relocation",
  "description": "Complete plan for relocating to Berlin, Germany",
  "icon": "🇩🇪",
  "modules": [
    {
      "title": "Visa & Immigration",
      "description": "All visa and legal documentation",
      "submodules": [
        {
          "title": "Gather Documents",
          "status": "in_progress",
          "checklist": [
            "Birth certificate apostilled",
            "Passport renewed",
            "University transcripts translated",
            "Employment contract signed"
          ],
          "notes": [
            "Apostille office hours: Mon-Fri 9am-3pm. Appointment required."
          ]
        },
        {
          "title": "Apply for Blue Card",
          "status": "not_started",
          "dueDate": "2026-04-15",
          "checklist": [
            "Fill application form",
            "Book embassy appointment",
            "Prepare photo (biometric)",
            "Pay application fee"
          ]
        }
      ]
    },
    {
      "title": "Housing",
      "submodules": [
        {
          "title": "Temporary Accommodation",
          "checklist": [
            "Book Airbnb for first 2 weeks",
            "Research co-living options"
          ]
        },
        {
          "title": "Permanent Apartment",
          "checklist": [
            "Create Immobilienscout24 account",
            "Prepare SCHUFA equivalent documents",
            "Schedule viewings"
          ]
        }
      ]
    }
  ]
}
```

#### Import Requirements

| ID | Requirement | Priority | Details |
|---|---|---|---|
| IM-01 | Paste JSON text | P0 | Textarea input where user pastes JSON directly. Real-time syntax validation. |
| IM-02 | Upload JSON file | P0 | File upload accepting `.json` files only. Max 1MB. Reads and parses the file content. |
| IM-03 | Schema validation | P0 | Validate against the import schema before processing. Display clear, line-specific error messages for invalid JSON. |
| IM-04 | Preview before import | P0 | After validation, show a tree preview of what will be created (roadmap → modules → submodules with counts). User confirms before actual creation. |
| IM-05 | Bulk creation | P0 | Single API call creates the roadmap + all modules + all submodules + all checklist items + all notes in one transaction. |
| IM-06 | Import progress | P1 | For large roadmaps, show a progress indicator during the creation process. |
| IM-07 | Error recovery | P1 | If import fails mid-way, roll back all created entities (atomic operation). Show error with details. |
| IM-08 | AI prompt template | P1 | Provide a copyable prompt template that users can paste into any AI tool to generate a roadmap in the correct format. |

#### Export Requirements

| ID | Requirement | Priority | Details |
|---|---|---|---|
| EX-01 | Export full roadmap | P1 | Download a `.json` file containing the roadmap + all modules + submodules + checklist items + notes, matching the import schema. |
| EX-02 | Export from menu | P1 | Available in the roadmap detail page menu (three-dot) as "Export as JSON". |
| EX-03 | File naming | P1 | Downloaded file named `{roadmap-title-slug}-{date}.json` (e.g., `germany-relocation-2026-02-11.json`). |

#### Size Limits

| Limit | Value |
|---|---|
| Max JSON payload size | 1MB |
| Max modules per import | 50 |
| Max submodules per module | 50 |
| Max checklist items per submodule | 100 |
| Max notes per submodule | 20 |

---

## 7. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| **Performance** | Initial page load | < 1s (LCP) |
| **Performance** | API response time | < 200ms (p95) |
| **Performance** | Optimistic UI | Checklist toggle, reorder feel instant |
| **Responsiveness** | Mobile breakpoint | Fully usable at 375px width |
| **Responsiveness** | Tablet breakpoint | Optimized layout at 768px |
| **Accessibility** | Keyboard navigation | Tab through all interactive elements |
| **Accessibility** | Screen reader | Semantic HTML, ARIA labels on icons |
| **Theme** | Dark mode | Optional (P2), system-preference detection |
| **SEO** | N/A | Private app, no SEO requirements |
| **Browser Support** | Chrome, Firefox, Safari | Latest 2 versions |

---

## 8. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.x (App Router) | Framework, SSR, API routes |
| **React** | 19.x | UI library |
| **TailwindCSS** | 4.x | Utility-first styling |
| **TanStack Query** | 5.x | Server state management, caching, optimistic updates |
| **Zustand** | 5.x | Minimal client state (modals, sidebar, UI state only) |
| **TipTap** | 2.x | Rich text editor for notes |
| **@dnd-kit** | 6.x | Drag-and-drop for reordering |
| **date-fns** | 4.x | Date formatting & manipulation |
| **@xyflow/react** | 12.x | Node-based flowchart canvas for visual roadmap |
| **dagre / elkjs** | latest | Auto-layout algorithm for node arrangement |
| **lucide-react** | latest | Icon set |

### Backend

| Technology | Purpose |
|---|---|
| **Next.js Route Handlers** | REST API endpoints (`app/api/...`) |
| **MongoDB** | Primary database |
| **Mongoose** | ODM for schema validation & queries |
| **NextAuth.js v5** | Authentication (Google OAuth) |

### Infrastructure

| Technology | Purpose |
|---|---|
| **DigitalOcean Spaces** | S3-compatible file storage |
| **AWS SDK v3 (S3 Client)** | File upload/download operations |
| **MongoDB Atlas** | Managed MongoDB hosting (recommended) |
| **Vercel** | Deployment (recommended for Next.js) |

---

## 9. Authentication & Authorization

### Flow

```
User clicks "Sign in with Google"
  → NextAuth redirects to Google OAuth consent screen
  → Google returns authorization code
  → NextAuth exchanges code for tokens
  → User profile fetched from Google
  → User upserted in MongoDB (findOrCreate by googleId)
  → JWT session created with { userId, email, name }
  → Redirect to /dashboard
```

### Session Strategy

- **JWT-based sessions** (no database sessions needed for single user)
- Token stored in HTTP-only, secure cookie
- Token refresh handled automatically by NextAuth

### Route Protection

| Route Pattern | Access |
|---|---|
| `/` | Public (landing/login) |
| `/auth/*` | Public (auth callbacks) |
| `/dashboard` | Protected |
| `/roadmap/*` | Protected |
| `/api/*` (except auth) | Protected (validate session) |

### Middleware

```typescript
// middleware.ts — protect all /dashboard and /roadmap routes
// Redirect to / if no valid session
// Pass userId from session to API handlers via headers or session lookup
```

### Authorization Rules

- Single user system: if authenticated, user has full access
- All DB queries scoped by `createdBy: session.userId` for data isolation (future-proofing for multi-tenant)

---

## 10. API Design

### Base URL: `/api/v1`

### Roadmaps

| Method | Endpoint | Description |
|---|---|---|
| GET | `/roadmaps` | List all roadmaps (with computed progress) |
| POST | `/roadmaps` | Create roadmap |
| GET | `/roadmaps/:id` | Get roadmap detail (with modules + progress) |
| PATCH | `/roadmaps/:id` | Update roadmap |
| DELETE | `/roadmaps/:id` | Delete roadmap (cascade) |
| PATCH | `/roadmaps/reorder` | Bulk update order |
| POST | `/roadmaps/import` | Bulk-create roadmap from JSON import schema (atomic) |
| GET | `/roadmaps/:id/export` | Export full roadmap as JSON matching import schema |

### Modules

| Method | Endpoint | Description |
|---|---|---|
| GET | `/roadmaps/:roadmapId/modules` | List modules for roadmap |
| POST | `/roadmaps/:roadmapId/modules` | Create module |
| PATCH | `/modules/:id` | Update module |
| DELETE | `/modules/:id` | Delete module (cascade) |
| PATCH | `/modules/reorder` | Bulk update order |

### SubModules

| Method | Endpoint | Description |
|---|---|---|
| GET | `/modules/:moduleId/submodules` | List submodules |
| POST | `/modules/:moduleId/submodules` | Create submodule |
| PATCH | `/submodules/:id` | Update submodule |
| DELETE | `/submodules/:id` | Delete submodule (cascade) |
| PATCH | `/submodules/reorder` | Bulk update order |

### Checklist Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/submodules/:subModuleId/checklist` | List checklist items |
| POST | `/submodules/:subModuleId/checklist` | Create checklist item |
| PATCH | `/checklist/:id` | Update item (title or isCompleted) |
| DELETE | `/checklist/:id` | Delete item |
| PATCH | `/checklist/reorder` | Bulk update order |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notes?entityType=X&entityId=Y` | Get notes for entity |
| POST | `/notes` | Create note |
| PATCH | `/notes/:id` | Update note content |
| DELETE | `/notes/:id` | Delete note |

### Files

| Method | Endpoint | Description |
|---|---|---|
| GET | `/submodules/:subModuleId/files` | List files for submodule |
| POST | `/files/presign` | Get presigned upload URL |
| POST | `/files` | Register uploaded file in DB |
| GET | `/files/:id/download` | Get presigned download URL |
| DELETE | `/files/:id` | Delete file (S3 + DB) |

### Roadmap Layout (Visual)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/roadmaps/:roadmapId/layout` | Get layout (nodes + edges + viewport) for visual view |
| PUT | `/roadmaps/:roadmapId/layout` | Save/overwrite entire layout (nodes, edges, viewport) |
| PATCH | `/roadmaps/:roadmapId/layout/nodes` | Batch update node positions only (lightweight drag-save) |
| POST | `/roadmaps/:roadmapId/layout/auto-arrange` | Server-side auto-layout calculation, returns new positions |

### Common Response Format

```typescript
// Success
{
  success: true,
  data: T
}

// Error
{
  success: false,
  error: {
    code: string,     // e.g., "VALIDATION_ERROR", "NOT_FOUND"
    message: string
  }
}
```

### Pagination (for future scaling)

- Not required for v1 (single user, limited data volume)
- API should accept `?page=1&limit=50` for future compatibility

---

## 11. UI/UX Guidelines

### Layout

```
┌─────────────────────────────────────────────────┐
│  TopBar: Logo | Breadcrumb          | User Menu  │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │         Main Content Area             │
│          │                                       │
│ - Home   │  (Dashboard / Roadmap / Module view)  │
│ - Roadmap│                                       │
│   list   │                                       │
│          │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

### Key Views

1. **Dashboard** (`/dashboard`)
   - Grid of roadmap cards
   - Each card: icon, title, progress bar, status badge, last updated
   - "Create Roadmap" button (prominent)

2. **Roadmap Detail** (`/roadmap/:id`)
   - Roadmap title + description (editable inline)
   - Progress bar (overall)
   - Modules listed as expandable cards
   - Each module shows submodule count + progress
   - Notes section at roadmap level

3. **Module Detail** (expanded or `/roadmap/:id/module/:moduleId`)
   - Module title + description
   - SubModules listed as cards/rows
   - Each SubModule shows: status badge, progress %, due date
   - Drag handle for reordering

4. **SubModule Detail** (slide-over panel or dedicated page)
   - Title, status dropdown, due date picker
   - Checklist section with add/toggle/reorder
   - Notes section (TipTap editor)
   - Files section (upload/list/delete)

5. **Roadmap Visual Preview** (`/roadmap/:id` — "Visual" tab)
   - Interactive node-based flowchart of the roadmap hierarchy
   - Modules as primary nodes, SubModules as child nodes, edges showing relationships
   - Nodes color-coded by status/progress
   - Lock mode (default): pan, zoom, click nodes for details, right-click for status toggle
   - Edit mode: drag nodes, add/delete nodes and edges

6. **Roadmap Visual Editor** (`/roadmap/:id/editor`)
   - Full-screen canvas, no sidebar
   - Top toolbar: back, save status, auto-layout, zoom controls, undo/redo, mode toggle
   - Free-form node placement and edge creation
   - Inline node title editing, double-click to add nodes
   - Auto-save indicator + explicit save button

### Design Tokens

| Token | Value |
|---|---|
| Primary color | `#2563EB` (blue-600) |
| Success | `#16A34A` (green-600) |
| Warning | `#D97706` (amber-600) |
| Danger | `#DC2626` (red-600) |
| Background | `#FFFFFF` (light) / `#0F172A` (dark) |
| Surface | `#F8FAFC` (light) / `#1E293B` (dark) |
| Text primary | `#0F172A` (light) / `#F8FAFC` (dark) |
| Text secondary | `#64748B` |
| Border | `#E2E8F0` (light) / `#334155` (dark) |
| Border radius | `8px` (cards), `6px` (inputs), `4px` (badges) |
| Font | Geist Sans (already configured) |

### Interaction Patterns

- **Optimistic updates**: Checklist toggles, reorders update UI immediately
- **Inline editing**: Click text to edit titles, press Enter to save, Escape to cancel
- **Confirmation dialogs**: Only for destructive actions (delete roadmap/module/submodule)
- **Toast notifications**: Success/error feedback for mutations
- **Loading states**: Skeleton screens on initial load, spinner on mutations
- **Empty states**: Helpful illustrations + CTA for empty dashboards, modules, etc.

---

## 12. File Storage

### Architecture

```
Client                    Next.js API              DigitalOcean Spaces
  │                           │                           │
  ├── POST /files/presign ───►│                           │
  │                           ├── Generate presigned URL─►│
  │◄── { uploadUrl, key } ────┤                           │
  │                           │                           │
  ├── PUT (direct upload) ────┼──────────────────────────►│
  │                           │                           │
  ├── POST /files ───────────►│                           │
  │   { key, fileName, ... }  ├── Save to MongoDB        │
  │◄── { file record } ───────┤                           │
```

### Configuration

```
Bucket: myflow-files
Region: sgp1 (or nearest)
ACL: private (all access via presigned URLs)
Presigned URL expiry: 1 hour (upload), 15 minutes (download)
Max file size: 10MB
```

### File Key Pattern

```
files/{userId}/{roadmapId}/{subModuleId}/{uuid}_{originalFileName}
```

---

## 13. Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx              # Auth guard, sidebar, topbar
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Roadmap grid
│   │   └── roadmap/
│   │       └── [roadmapId]/
│   │           ├── page.tsx        # Roadmap detail (list + visual tabs)
│   │           ├── editor/
│   │           │   └── page.tsx    # Full-screen visual editor
│   │           └── module/
│   │               └── [moduleId]/
│   │                   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── v1/
│   │       ├── roadmaps/
│   │       │   ├── route.ts        # GET (list), POST (create)
│   │       │   ├── import/
│   │       │   │   └── route.ts    # POST (bulk import from JSON)
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts    # GET, PATCH, DELETE
│   │       │   │   ├── export/
│   │       │   │   │   └── route.ts  # GET (export as JSON)
│   │       │   │   └── layout/
│   │       │   │       └── route.ts  # GET, PUT (visual layout)
│   │       │   └── reorder/
│   │       │       └── route.ts    # PATCH
│   │       ├── modules/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── reorder/
│   │       │       └── route.ts
│   │       ├── submodules/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── reorder/
│   │       │       └── route.ts
│   │       ├── checklist/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── reorder/
│   │       │       └── route.ts
│   │       ├── notes/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── files/
│   │           ├── route.ts
│   │           ├── presign/
│   │           │   └── route.ts
│   │           └── [id]/
│   │               ├── route.ts
│   │               └── download/
│   │                   └── route.ts
│   ├── layout.tsx
│   ├── page.tsx                    # Landing / login redirect
│   └── globals.css
│
├── components/
│   ├── ui/                         # Reusable primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   ├── badge.tsx
│   │   ├── progress-bar.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── date-picker.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── breadcrumb.tsx
│   ├── roadmap/
│   │   ├── roadmap-card.tsx
│   │   ├── roadmap-form.tsx
│   │   ├── roadmap-grid.tsx
│   │   └── roadmap-import.tsx      # JSON import dialog (paste + upload)
│   ├── module/
│   │   ├── module-card.tsx
│   │   ├── module-form.tsx
│   │   └── module-list.tsx
│   ├── submodule/
│   │   ├── submodule-card.tsx
│   │   ├── submodule-form.tsx
│   │   ├── submodule-detail.tsx
│   │   └── status-badge.tsx
│   ├── visual/
│   │   ├── flow-canvas.tsx         # @xyflow/react wrapper
│   │   ├── module-node.tsx         # Custom Module node component
│   │   ├── submodule-node.tsx      # Custom SubModule node component
│   │   ├── roadmap-node.tsx        # Root roadmap node
│   │   ├── node-context-menu.tsx   # Right-click context menu for nodes
│   │   ├── editor-toolbar.tsx      # Top toolbar for editor page
│   │   ├── minimap-panel.tsx       # Minimap overlay
│   │   └── auto-layout.ts         # Dagre/ELK layout algorithm wrapper
│   ├── checklist/
│   │   ├── checklist-item.tsx
│   │   └── checklist-list.tsx
│   ├── notes/
│   │   ├── note-editor.tsx         # TipTap wrapper
│   │   └── note-list.tsx
│   └── files/
│       ├── file-upload.tsx
│       └── file-list.tsx
│
├── lib/
│   ├── db/
│   │   ├── connection.ts           # MongoDB connection singleton
│   │   └── models/
│   │       ├── user.ts
│   │       ├── roadmap.ts
│   │       ├── module.ts
│   │       ├── submodule.ts
│   │       ├── checklist-item.ts
│   │       ├── note.ts
│   │       ├── file.ts
│       └── roadmap-layout.ts
│   ├── auth/
│   │   ├── config.ts               # NextAuth configuration
│   │   └── helpers.ts              # getServerSession wrapper
│   ├── s3/
│   │   └── client.ts               # S3 client + presign helpers
│   ├── api/
│   │   └── helpers.ts              # Response formatters, error handler
│   └── utils/
│       ├── progress.ts             # Progress calculation utilities
│       ├── reorder.ts              # Reorder logic (order field management)
│       └── import-schema.ts        # JSON import schema validation + types
│
├── hooks/
│   ├── use-roadmaps.ts             # TanStack Query hooks
│   ├── use-modules.ts
│   ├── use-submodules.ts
│   ├── use-checklist.ts
│   ├── use-notes.ts
│   ├── use-files.ts
│   └── use-layout.ts              # TanStack Query hooks for roadmap layout
│
├── stores/
│   └── ui-store.ts                 # Zustand: sidebar state, modals, theme
│
├── types/
│   └── index.ts                    # Shared TypeScript interfaces
│
└── middleware.ts                    # Auth route protection
```

---

## 14. Implementation Phases

### Phase 1: Foundation (Week 1)

| Task | Details |
|---|---|
| Project setup | Install dependencies, configure Tailwind, set up path aliases |
| MongoDB connection | Mongoose setup, connection singleton, all models |
| Authentication | NextAuth v5 with Google provider, JWT sessions |
| Middleware | Route protection for `/dashboard`, `/roadmap/*`, `/api/v1/*` |
| UI shell | Layout with sidebar, topbar, breadcrumb |
| Landing page | Simple login page with Google sign-in button |

### Phase 2: Core CRUD (Week 2)

| Task | Details |
|---|---|
| Roadmap API + UI | CRUD endpoints, dashboard grid with cards, create/edit dialog, JSON import dialog |
| JSON import | Import schema validation, preview tree, bulk-create API, paste JSON + upload file UI |
| Module API + UI | CRUD endpoints, module list within roadmap, expand/collapse |
| SubModule API + UI | CRUD endpoints, submodule cards, status dropdown, due date |
| Progress calculation | Auto-compute at all levels, display progress bars |

### Phase 3: Visual Roadmap (Week 3)

| Task | Details |
|---|---|
| React Flow setup | Install @xyflow/react, create flow-canvas wrapper component, custom node types |
| Custom node components | Module node, SubModule node, root Roadmap node with status colors and progress |
| Lock mode (Preview) | Read-only canvas with pan/zoom, node click for details, right-click status context menu, minimap |
| Edit mode | Free-form node drag, inline title edit, add/delete nodes via double-click/toolbar, edge creation |
| Layout API + persistence | GET/PUT layout endpoints, RoadmapLayout Mongoose model, auto-save (30s debounce) |
| Editor page | Full-screen `/roadmap/:id/editor` route with toolbar (save, auto-layout, zoom, undo/redo) |
| Auto-layout | Dagre integration for one-click top-down tree arrangement |
| Layout sync | Auto-create nodes when modules/submodules are added via list view; remove orphaned nodes on layout load |

### Phase 4: Checklist & Notes (Week 4)

| Task | Details |
|---|---|
| Checklist API + UI | Add/toggle/delete/reorder items, optimistic updates |
| TipTap integration | Install TipTap, configure toolbar, save/load notes |
| Notes API + UI | CRUD for notes attached to any entity level |
| Drag-and-drop | @dnd-kit for modules, submodules, checklist reorder |

### Phase 5: Files & Polish (Week 5)

| Task | Details |
|---|---|
| S3 setup | DigitalOcean Spaces config, presigned URLs |
| File upload UI | Drag-and-drop zone, progress indicator, file list |
| File API | Presign, register, download, delete endpoints |
| Toast notifications | Success/error feedback across all mutations |
| Empty states | Illustrations and CTAs for empty collections |
| Mobile responsive | Test and fix all views at 375px and 768px |
| Error handling | Global error boundary, API error formatting |

### Phase 6: Enhancements (Week 6, optional)

| Task | Details |
|---|---|
| Dark mode | System preference detection, manual toggle |
| Keyboard shortcuts | `Ctrl+N` new item, `Enter` quick-add, `Escape` cancel |
| Search | Quick search across roadmaps, modules, submodules |
| JSON export | Export roadmap as JSON matching import schema, downloadable file |
| AI prompt template | In-app copyable prompt for generating roadmaps via ChatGPT/Gemini/Claude |

---

## 15. Risk & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep into collaboration features | High | Strict adherence to single-user philosophy. No sharing, no permissions, no real-time sync. |
| Complex drag-and-drop edge cases | Medium | Use battle-tested @dnd-kit. Limit drag to within parent container only. |
| File upload failures | Medium | Client-side validation (size/type) before upload. Retry logic. Cleanup orphaned S3 objects. |
| TipTap bundle size | Low | Dynamic import (`next/dynamic`) with SSR disabled. Load only on note editing. |
| MongoDB connection limits | Low | Singleton connection pattern. Connection pooling configured. |
| Over-engineering data model | Medium | Start with denormalized `roadmapId` on child documents for query efficiency. Avoid joins. |
| React Flow performance with large graphs | Medium | Limit visible nodes via viewport culling (built into @xyflow/react). Lazy-load node detail data. Cap at ~200 nodes per roadmap. |
| Layout data sync with CRUD operations | Medium | When modules/submodules are created or deleted via list view, auto-add/remove nodes in layout. Orphan cleanup on layout load. |
| Visual editor complexity/scope creep | High | Lock mode is P0, edit mode is P0 but keep features minimal. Defer node resize (P2), custom edge styles (P2), grouping (future). |
| Malformed JSON import crashing server | Medium | Strict schema validation on client AND server. Size limits enforced. Atomic transaction with rollback on partial failure. |
| AI-generated JSON inconsistency | Low | Schema is intentionally simple (no IDs, no nested references). AI tools produce valid output 95%+ of the time. Validation catches the rest. |

---

## Appendix A: Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-string>

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>

# DigitalOcean Spaces (S3-compatible)
S3_ENDPOINT=https://sgp1.digitaloceanspaces.com
S3_REGION=sgp1
S3_BUCKET=myflow-files
S3_ACCESS_KEY=<do-spaces-access-key>
S3_SECRET_KEY=<do-spaces-secret-key>
```

---

## Appendix B: Key Technical Decisions

| Decision | Rationale |
|---|---|
| **Mongoose over native driver** | Schema validation, middleware hooks, and type generation outweigh minimal overhead for this project size. |
| **JWT over database sessions** | Single user, no need for session revocation. Simpler, fewer DB queries. |
| **Denormalized `roadmapId`** | Avoid multi-collection lookups. Every child document carries `roadmapId` for efficient cascade deletes and queries. |
| **TanStack Query over SWR** | Better devtools, built-in optimistic update support, more granular cache invalidation. |
| **@dnd-kit over react-beautiful-dnd** | Actively maintained, better accessibility, lighter bundle, works with React 19. |
| **Presigned URLs for file upload** | Direct client-to-S3 upload avoids Next.js server as bottleneck. Reduces server memory usage. |
| **API versioning (`/api/v1`)** | Future-proofs for breaking API changes if SaaS conversion happens. |
| **Separate Note entity** | Polymorphic attachment to any entity level allows flexible note placement without schema changes. |
| **@xyflow/react for visual canvas** | Most mature React node-graph library. Built-in pan/zoom, minimap, custom nodes, edge routing. Active maintenance, works with React 19. |
| **Separate RoadmapLayout entity** | Decouples visual positioning from structural data. Modules/SubModules stay clean. Layout is loaded only when visual view is active. |
| **Dagre for auto-layout** | Lightweight directed-graph layout algorithm. Produces clean top-down tree structures. Runs client-side, no server dependency. |
| **Lock mode as default** | Prevents accidental edits. Most interactions are viewing/tracking progress, not restructuring. Edit mode is an explicit opt-in. |
| **Simple import schema (no IDs)** | Import JSON uses only titles and content — no ObjectIds, no order fields, no createdBy. Server generates all IDs and metadata. This makes the schema trivial for AI tools to produce and for users to hand-write. |
| **Atomic import via transaction** | Bulk import uses a MongoDB transaction. All-or-nothing: if any entity fails to create, everything rolls back. No orphaned partial roadmaps. |

---

*End of PRD*
