# MyFlow — Front-End Developer Guide

> **Version:** 1.1
> **Last Updated:** 2026-02-11
> **Prerequisite:** Read `docs/PRD.md` before starting.

This guide is your single source of truth for building every screen, component, and interaction in MyFlow. Follow it top-to-bottom. Each section tells you **what** to build, **how** it should look, **how** it should behave, and **what edge cases** to handle -- without prescribing code.

---

## Table of Contents

1. [Implementation Order](#1-implementation-order)
2. [Design System Foundation](#2-design-system-foundation)
3. [Shared UI Components](#3-shared-ui-components)
4. [App Shell & Layout](#4-app-shell--layout)
5. [Page: Login](#5-page-login)
6. [Page: Dashboard](#6-page-dashboard)
7. [Page: Roadmap Detail](#7-page-roadmap-detail)
8. [Page: Roadmap Visual Preview](#8-page-roadmap-visual-preview)
9. [Page: Roadmap Visual Editor](#9-page-roadmap-visual-editor)
10. [Page: Module Detail](#10-page-module-detail)
11. [Panel: SubModule Detail](#11-panel-submodule-detail)
12. [Feature: Checklist](#12-feature-checklist)
13. [Feature: Notes (TipTap)](#13-feature-notes-tiptap)
14. [Feature: File Upload](#14-feature-file-upload)
15. [Feature: Drag-and-Drop](#15-feature-drag-and-drop)
16. [State Management Strategy](#16-state-management-strategy)
17. [Data Fetching Patterns](#17-data-fetching-patterns)
18. [Responsive Behavior](#18-responsive-behavior)
19. [Loading, Empty & Error States](#19-loading-empty--error-states)
20. [Accessibility Checklist](#20-accessibility-checklist)
21. [Keyboard Shortcuts](#21-keyboard-shortcuts)
22. [Dark Mode (P2)](#22-dark-mode-p2)

---

## 1. Implementation Order

Build in this exact sequence. Each step depends on the previous one.

| Step | What to Build | Depends On |
|------|--------------|------------|
| 1 | Design system tokens + Tailwind config | Nothing |
| 2 | Shared UI primitives (Button, Input, Dialog, Badge, ProgressBar, Skeleton, Toast, Dropdown, DatePicker) | Step 1 |
| 3 | App shell layout (Sidebar, TopBar, Breadcrumb) | Step 2 |
| 4 | Login page | Step 3 |
| 5 | Dashboard page (roadmap cards + grid) | Step 3 |
| 6 | Roadmap create/edit dialog + JSON import dialog | Step 5 |
| 7 | Roadmap detail page (list view with module list, view toggle tabs) | Step 5 |
| 8 | Roadmap visual preview — lock mode (React Flow canvas, custom nodes, pan/zoom, minimap) | Step 7 |
| 9 | Roadmap visual preview — edit mode (node drag, add/delete nodes & edges, inline edit) | Step 8 |
| 10 | Roadmap visual editor page — full-screen editor with toolbar, auto-layout, undo/redo | Step 9 |
| 11 | Module create/edit + module cards | Step 7 |
| 12 | SubModule cards within modules | Step 11 |
| 13 | SubModule detail slide-over panel | Step 12 |
| 14 | Checklist inside SubModule detail | Step 13 |
| 15 | Notes editor (TipTap) inside SubModule detail | Step 13 |
| 16 | Notes on Roadmap and Module levels | Step 15 |
| 17 | File upload inside SubModule detail | Step 13 |
| 18 | Drag-and-drop on modules, submodules, checklist | Steps 11, 12, 14 |
| 19 | Toast notifications across all mutations | Step 2 |
| 20 | Empty states for all collections | Steps 5-17 |
| 21 | Responsive pass on all pages | Steps 5-17 |
| 22 | Dark mode toggle (optional) | Step 1 |

---

## 2. Design System Foundation

### 2.1 Color Tokens

Define these as CSS custom properties at `:root` and reference them through Tailwind.

| Token Name | Light Value | Dark Value | Usage |
|-----------|------------|------------|-------|
| `--color-primary` | `#2563EB` | `#3B82F6` | Buttons, links, active states |
| `--color-primary-hover` | `#1D4ED8` | `#2563EB` | Button hover |
| `--color-primary-light` | `#DBEAFE` | `#1E3A5F` | Primary backgrounds, selected states |
| `--color-success` | `#16A34A` | `#22C55E` | Completed status, success toasts |
| `--color-warning` | `#D97706` | `#F59E0B` | Overdue dates, warning toasts |
| `--color-danger` | `#DC2626` | `#EF4444` | Delete buttons, error toasts |
| `--color-danger-light` | `#FEE2E2` | `#451A1A` | Danger backgrounds |
| `--color-bg` | `#FFFFFF` | `#0F172A` | Page background |
| `--color-surface` | `#F8FAFC` | `#1E293B` | Card backgrounds, sidebar |
| `--color-surface-hover` | `#F1F5F9` | `#334155` | Card hover, row hover |
| `--color-text-primary` | `#0F172A` | `#F8FAFC` | Headings, body text |
| `--color-text-secondary` | `#64748B` | `#94A3B8` | Descriptions, timestamps, labels |
| `--color-text-tertiary` | `#94A3B8` | `#64748B` | Placeholder text |
| `--color-border` | `#E2E8F0` | `#334155` | Card borders, dividers, input borders |
| `--color-border-focus` | `#2563EB` | `#3B82F6` | Input focus ring |

### 2.2 Typography Scale

Font family: **Geist Sans** (already loaded in `layout.tsx`). Monospace: **Geist Mono**.

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `heading-xl` | 24px | 700 | 32px | Page titles (Dashboard, Roadmap name) |
| `heading-lg` | 20px | 600 | 28px | Section titles (Module names) |
| `heading-md` | 16px | 600 | 24px | Card titles, SubModule names |
| `body` | 14px | 400 | 20px | General text, descriptions |
| `body-sm` | 13px | 400 | 18px | Secondary info, timestamps |
| `caption` | 12px | 500 | 16px | Badges, labels, counts |

### 2.3 Spacing

Use a 4px base grid. All spacing should be multiples of 4.

| Token | Value | Common Usage |
|-------|-------|-------------|
| `xs` | 4px | Icon padding, tight gaps |
| `sm` | 8px | Inline element gaps, badge padding |
| `md` | 12px | Input padding, small section gaps |
| `base` | 16px | Card padding, standard gaps |
| `lg` | 20px | Section gaps |
| `xl` | 24px | Page padding, major section gaps |
| `2xl` | 32px | Page top margin, large separators |
| `3xl` | 48px | Hero spacing (login page) |

### 2.4 Border Radius

| Usage | Value |
|-------|-------|
| Cards, dialogs | 8px |
| Inputs, dropdowns | 6px |
| Badges, tags | 4px |
| Avatars, icons | Full (50%) |
| Buttons | 6px |
| Flow nodes | 8px |

### 2.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards at rest |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards on hover, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Dialogs, slide-over panels |
| `shadow-toast` | `0 4px 12px rgba(0,0,0,0.15)` | Toast notifications |
| `shadow-node` | `0 2px 8px rgba(0,0,0,0.08)` | Flow canvas nodes |
| `shadow-node-selected` | `0 0 0 2px var(--color-primary)` | Selected flow node |

### 2.6 Transitions

All interactive elements: `150ms ease` for color/background changes, `200ms ease` for transforms/position, `300ms ease` for panel slide-in/out.

### 2.7 Z-Index Scale

| Layer | Z-Index | Element |
|-------|---------|---------|
| Base | 0 | Page content |
| Canvas Controls | 5 | Flow minimap, zoom controls overlay |
| Sticky | 10 | TopBar, sticky headers |
| Sidebar | 20 | Sidebar (mobile overlay) |
| Dropdown | 30 | Dropdown menus, popovers, node context menu |
| Dialog | 40 | Modal dialogs |
| Slide-over | 45 | SubModule detail panel |
| Toast | 50 | Toast notifications |

---

## 3. Shared UI Components

Build these first. Every page depends on them. For each component below, the spec defines variants, sizes, states, and behavior.

### 3.1 Button

**Variants:**

| Variant | Appearance | Use Case |
|---------|-----------|----------|
| `primary` | Solid primary color bg, white text | Main actions: "Create Roadmap", "Save" |
| `secondary` | Transparent bg, primary color text, primary border | Secondary actions: "Cancel", "Add Module" |
| `ghost` | Transparent bg, text-secondary color, no border | Subtle actions: icon buttons, "Edit" |
| `danger` | Solid danger bg, white text | Delete confirmations |
| `danger-ghost` | Transparent bg, danger text | Inline delete buttons |

**Sizes:**

| Size | Height | Padding (horizontal) | Font |
|------|--------|---------------------|------|
| `sm` | 32px | 12px | body-sm |
| `md` | 36px | 16px | body |
| `lg` | 40px | 20px | body |

**States:** default, hover (darken bg 10%), active (darken 15%), disabled (50% opacity, no pointer events), loading (spinner replacing text, same dimensions).

**Behavior:**
- If `loading` is true, show a small spinner icon and disable clicks
- Icon-only buttons use equal width/height (square) with centered icon
- Always set `type="button"` except in forms where it should be `type="submit"`

### 3.2 Input

**Variants:** `default`, `error`

**Anatomy:** Optional label above, input field, optional helper/error text below.

| Property | Value |
|----------|-------|
| Height | 36px |
| Padding | 8px 12px |
| Border | 1px solid `--color-border` |
| Focus | 2px ring `--color-border-focus`, border becomes primary |
| Error | Border and ring become `--color-danger` |
| Placeholder | `--color-text-tertiary` |

**Behavior:**
- Label floats above (static position, not animated)
- Error message appears below in `caption` size, danger color
- Auto-focus support via prop

### 3.3 Dialog (Modal)

**Anatomy:** Overlay backdrop + centered content panel.

| Property | Value |
|----------|-------|
| Backdrop | Black at 50% opacity |
| Panel max-width | 480px (small), 640px (medium) |
| Panel padding | 24px |
| Border radius | 8px |
| Shadow | `shadow-lg` |

**Sections:**
1. **Header:** Title (heading-lg) + optional close (X) icon button, top-right
2. **Body:** Form fields or confirmation text
3. **Footer:** Action buttons, right-aligned. Primary action right, cancel left.

**Behavior:**
- Opens with fade-in backdrop + scale-up panel (200ms)
- Closes on backdrop click, Escape key, or close button
- Traps focus within dialog when open
- Returns focus to trigger element on close
- Body scroll locked when dialog is open

### 3.4 Dropdown Menu

**Anatomy:** Trigger element + floating menu panel.

| Property | Value |
|----------|-------|
| Menu min-width | 160px |
| Item height | 36px |
| Item padding | 8px 12px |
| Border radius | 6px |
| Shadow | `shadow-md` |

**Item Types:**
- Standard item: icon (optional) + label
- Danger item: danger color text + icon
- Separator: horizontal line between groups

**Behavior:**
- Opens on click (not hover)
- Positions below trigger, aligns to right edge
- If overflowing viewport, flip to above trigger
- Closes on item click, outside click, or Escape
- Keyboard: arrow keys to navigate items, Enter to select, Escape to close

### 3.5 Badge

**Variants based on semantics:**

| Variant | Background | Text Color | Usage |
|---------|-----------|------------|-------|
| `active` | `--color-primary-light` | `--color-primary` | Roadmap active status |
| `completed` | green-50 | green-700 | Completed status |
| `blocked` | red-50 | red-700 | Blocked SubModule |
| `not_started` | gray-100 | gray-600 | Not started SubModule |
| `in_progress` | amber-50 | amber-700 | In progress SubModule |
| `archived` | gray-100 | gray-500 | Archived roadmap |

**Size:** Fixed height 22px, padding 4px 8px, `caption` font, border-radius 4px.

### 3.6 Progress Bar

**Anatomy:** Background track + filled bar + optional percentage label.

| Property | Value |
|----------|-------|
| Track height | 6px (compact), 8px (standard) |
| Track bg | `--color-border` |
| Fill bg | `--color-primary` (0-99%), `--color-success` (100%) |
| Border radius | Full (pill shape) |
| Label | `caption` size, positioned right of bar or above |

**Behavior:**
- Fill width transitions smoothly on value change (300ms ease)
- 0% shows empty track (no fill)
- 100% turns fill green and optionally shows a checkmark icon

### 3.7 Skeleton

Placeholder loading shapes that match the layout of the content they replace.

**Types needed:**
- `skeleton-card` — Rectangular block matching roadmap card dimensions
- `skeleton-line` — Single line of text, variable width (60-90%)
- `skeleton-circle` — Avatar or icon placeholder
- `skeleton-progress` — Progress bar placeholder

**Behavior:** Subtle shimmer animation (left-to-right gradient sweep, 1.5s loop).

### 3.8 Toast

**Position:** Fixed bottom-right, 16px from edges. Stack vertically with 8px gap.

**Variants:**

| Variant | Left accent | Icon |
|---------|------------|------|
| `success` | Green bar | Checkmark circle |
| `error` | Red bar | X circle |
| `info` | Blue bar | Info circle |

**Anatomy:** Left color accent bar (4px wide) + icon + message text + optional close button.

| Property | Value |
|----------|-------|
| Width | 360px (max), auto (min) |
| Padding | 12px 16px |
| Shadow | `shadow-toast` |
| Border radius | 8px |

**Behavior:**
- Slides in from right (200ms)
- Auto-dismisses after 4 seconds
- Close button dismisses immediately
- Max 3 toasts visible at once; oldest dismissed first
- On mobile: full-width, positioned at bottom with 8px margin

### 3.9 Date Picker

**Trigger:** Input field showing formatted date ("Feb 11, 2026") or placeholder "Set due date".

**Panel:** Calendar dropdown below the trigger.

| Property | Value |
|----------|-------|
| Panel width | 280px |
| Day cell | 36px square |
| Shadow | `shadow-md` |

**Features:**
- Month/year navigation with arrow buttons
- Today highlighted with primary outline
- Selected date with primary solid fill
- Past dates allowed (no restriction)
- "Clear" action to remove the date
- Overdue indicator: if selected date is in the past and SubModule is not completed, show the date in danger color

### 3.10 Confirm Dialog

A specialized Dialog for destructive actions.

**Content:**
- Icon: Warning triangle in amber/danger
- Title: "Delete {entity name}?"
- Description: Explains what will be deleted (including children cascade)
- Buttons: "Cancel" (secondary) + "Delete" (danger)

**Behavior:**
- Delete button shows loading state during API call
- Cancel always available during loading
- Auto-closes on success

### 3.11 Context Menu

A right-click menu used on canvas nodes and other contextual interactions.

**Anatomy:** Floating panel positioned at cursor coordinates.

| Property | Value |
|----------|-------|
| Min-width | 180px |
| Shadow | `shadow-md` |
| Border radius | 6px |
| Border | 1px solid `--color-border` |
| Background | `--color-bg` |
| Z-index | 30 |

**Items:** Same as Dropdown Menu — standard items, danger items, separators.

**Behavior:**
- Opens on right-click at the mouse position
- On touch devices: opens on long-press (300ms)
- Closes on item click, outside click, Escape, or scroll
- If menu would overflow viewport, reposition to fit

---

## 4. App Shell & Layout

### 4.1 Overall Structure

The protected area (`/dashboard`, `/roadmap/*`) shares a common shell layout. The visual editor page (`/roadmap/:id/editor`) uses a **separate full-screen layout** with no sidebar.

**Standard layout (desktop, 1024px+):**

```
┌──────────────────────────────────────────────────────────┐
│ TopBar (height: 56px, sticky top)                         │
├────────────┬─────────────────────────────────────────────┤
│            │                                              │
│  Sidebar   │           Main Content                       │
│  (240px)   │           (flex: 1, overflow-y: auto)        │
│  fixed     │           padding: 24px                      │
│  left      │                                              │
│            │                                              │
│            │                                              │
└────────────┴─────────────────────────────────────────────┘
```

**Editor layout (full-screen, used by `/roadmap/:id/editor`):**

```
┌──────────────────────────────────────────────────────────┐
│ EditorToolbar (height: 48px, sticky top)                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│              Full-Screen Canvas                           │
│              (100vw × calc(100vh - 48px))                 │
│              no padding, no sidebar                       │
│                                                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 4.2 TopBar

**Height:** 56px, full width, sticky top, z-index 10.

**Background:** `--color-bg` with bottom border (`--color-border`).

**Left section:**
- Logo / App name "MyFlow" — heading-md weight 700, primary color
- Breadcrumb (see 4.4)

**Right section:**
- User avatar (32px circle, Google profile image)
- Clicking avatar opens a dropdown with:
  - User name + email (non-interactive, caption text)
  - Separator
  - "Sign out" item

**Mobile (<768px):**
- Logo left, hamburger menu icon replacing breadcrumb
- Avatar right
- Hamburger toggles sidebar overlay

### 4.3 Sidebar

**Width:** 240px fixed on desktop. Collapsible.

**Background:** `--color-surface` with right border.

**Sections:**

1. **Navigation (top)**
   - "Dashboard" — home icon + label. Active state: primary-light background, primary text.
   - Separator line

2. **Roadmap Quick List (scrollable)**
   - Heading: "ROADMAPS" in caption, text-secondary, uppercase, tracking-wide
   - List of roadmap titles (body-sm), each with:
     - Roadmap emoji/icon (if set) or default circle icon
     - Title (truncate with ellipsis if > ~20 chars)
     - Active state: same as Dashboard active
   - Clicking a roadmap navigates to `/roadmap/:id`
   - This list auto-updates when roadmaps are created/deleted

3. **Footer (bottom, sticky)**
   - "New Roadmap" button — ghost variant, full width, plus icon + text
   - Collapses to just the plus icon when sidebar is collapsed

**Collapsed state (icon only, 64px wide):**
- Toggle via a collapse/expand arrow button at top of sidebar
- Shows only icons, no text labels
- Roadmap list shows only emoji/icon
- Tooltip on hover showing full name

**Mobile (<768px):**
- Sidebar is an overlay panel sliding from left
- Backdrop overlay (like dialog)
- Closes on navigation, outside click, or close button
- No collapsed state on mobile — full or hidden

### 4.4 Breadcrumb

**Location:** Inside TopBar, after the logo.

**Segments:**
- Dashboard (always, linked)
- Roadmap title (when on roadmap or deeper, linked)
- "Visual Editor" (when on `/roadmap/:id/editor`, not linked — current page)
- Module title (when on module detail, not linked — current page)

**Separator:** Chevron-right icon (16px, text-tertiary).

**Behavior:**
- Each segment is clickable (except current/last)
- Long titles truncated with ellipsis (max 200px per segment)
- On mobile: show only the current page title (no breadcrumb chain)

---

## 5. Page: Login

**Route:** `/` (root) and `/login`

**Purpose:** Single sign-in screen. If already authenticated, redirect to `/dashboard`.

### Layout

Full-screen centered content, no sidebar/topbar.

**Background:** `--color-bg` with subtle grid or dot pattern (optional decorative touch).

**Content card (centered):**

| Property | Value |
|----------|-------|
| Max width | 400px |
| Padding | 48px 32px |
| Border radius | 8px |
| Shadow | `shadow-md` |
| Background | `--color-bg` |

**Content (top to bottom):**

1. App logo / name "MyFlow" — heading-xl, primary color, centered
2. Tagline — body, text-secondary, centered. Example: "Structured goal execution, simplified."
3. Spacer: 32px
4. "Sign in with Google" button
   - Full width
   - Height: 44px
   - White background, 1px gray border, 6px radius
   - Google "G" icon on the left + "Sign in with Google" text
   - Hover: light gray background
   - Loading state: spinner replacing Google icon
5. Spacer: 16px
6. Footer text — caption, text-tertiary. Example: "Personal use only. Single-user system."

### Behavior

- On page load, check session. If valid, redirect to `/dashboard` immediately (no flash of login page).
- On sign-in click, initiate NextAuth Google flow.
- On auth error, show an error toast: "Sign-in failed. Please try again."

---

## 6. Page: Dashboard

**Route:** `/dashboard`

**Purpose:** Home screen. Shows all roadmaps as cards with progress.

### Page Header

**Left:** Page title "Dashboard" — heading-xl
**Right:** Two buttons side by side:
- "Import JSON" button — secondary variant, md size, upload icon + "Import JSON"
- "New Roadmap" button — primary variant, md size, plus icon + "New Roadmap"

### Roadmap Grid

**Layout:** Responsive grid.
- Desktop (1024px+): 3 columns
- Tablet (768-1023px): 2 columns
- Mobile (<768px): 1 column
- Grid gap: 16px

### 6.1 Roadmap Card

Each card represents one roadmap.

**Anatomy:**

```
┌──────────────────────────────────┐
│  [icon]  Title               ... │  ← header row
│  Description text (2 lines max)  │  ← body
│                                  │
│  ████████░░░░░░░░░  45%          │  ← progress bar + label
│                                  │
│  ● Active    Updated 2d ago      │  ← footer: status + timestamp
└──────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Padding | 16px |
| Border | 1px solid `--color-border` |
| Border radius | 8px |
| Background | `--color-bg` |
| Shadow | `shadow-sm` |
| Hover | `shadow-md`, border becomes `--color-primary` at 30% opacity |

**Elements:**

1. **Icon** — Emoji (24px) or default roadmap icon (lucide: `Map` or `Route`), aligned left
2. **Title** — heading-md, single line, truncate with ellipsis
3. **Menu trigger** — Three-dot icon (top-right corner), ghost button
   - Opens dropdown: "Edit", "Export as JSON", "Archive", separator, "Delete" (danger)
4. **Description** — body-sm, text-secondary, max 2 lines, clamp with ellipsis
5. **Progress bar** — standard size, with percentage label right-aligned
6. **Status badge** — bottom-left (active / completed / archived)
7. **Timestamp** — bottom-right, body-sm, text-tertiary, relative time ("2d ago", "just now")

**Interaction:**
- Entire card is clickable — navigates to `/roadmap/:id`
- Menu trigger (three-dot) stops event propagation (click on it should NOT navigate)
- Hover lifts card slightly (translateY -1px + shadow transition)

### 6.2 Create Roadmap Dialog

**Trigger:** "New Roadmap" button in page header, or "New Roadmap" in sidebar footer.

**Dialog size:** Small (480px max-width).

**Form fields:**

1. **Icon selector** — Click to open an emoji picker (simple grid of commonly used emojis, 5x6 grid). Default: clipboard/map emoji. Optional.
2. **Title** — Input, required. Placeholder: "e.g., Germany Relocation". Auto-focused on dialog open.
3. **Description** — Textarea (3 rows), optional. Placeholder: "Brief description of this roadmap..."

**Footer buttons:** "Cancel" (secondary) + "Create Roadmap" (primary).

**Behavior:**
- Title is required — show error state if empty on submit attempt
- On success: close dialog, show success toast, new card appears in grid (optimistic), navigate to the new roadmap detail page
- On error: keep dialog open, show error toast

### 6.3 Edit Roadmap Dialog

**Trigger:** "Edit" from card dropdown menu.

**Same as Create dialog** but:
- Title: "Edit Roadmap"
- Fields pre-populated with current values
- Submit button: "Save Changes"
- On success: update card in-place, show success toast

### 6.4 Import Roadmap from JSON

**Trigger:** "Import JSON" button in the dashboard header.

**Purpose:** Allows the user to paste AI-generated JSON or upload a `.json` file to create a fully populated roadmap in one step.

**Dialog size:** Medium (640px max-width).

**Dialog has three sequential steps displayed as a stepper flow within a single dialog.**

#### Step 1: Input JSON

```
┌────────────────────────────────────────────────────┐
│  Import Roadmap from JSON                      [X] │
│                                                    │
│  (1) Paste JSON  ·  (2) Preview  ·  (3) Import    │
│  ─────────────────────────────────────────────── │
│                                                    │
│  [ Paste JSON ]  [ Upload File ]                   │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  {                                           │  │
│  │    "title": "Germany Relocation",            │  │
│  │    ...                                       │  │
│  │                                              │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [📋 Copy AI Prompt]              [Next →]         │
└────────────────────────────────────────────────────┘
```

**Anatomy:**

1. **Step indicator** — Three-step horizontal stepper: "Paste JSON", "Preview", "Import". Current step highlighted in primary color. Future steps in text-tertiary.

2. **Input mode tabs** — Two small tabs: "Paste JSON" (default, active) and "Upload File"
   - **Paste JSON tab:** Shows a code-style textarea
   - **Upload File tab:** Shows a file drop zone (same pattern as file upload in section 14 but accepts only `.json`, max 1MB)

3. **Code textarea (Paste mode):**
   - Monospace font (Geist Mono)
   - Min height: 280px
   - Background: `--color-surface`
   - Border: 1px `--color-border`, 6px radius
   - Line numbers optional but nice-to-have
   - Placeholder: pre-filled with a short example skeleton showing the expected format
   - Real-time JSON syntax highlighting is NOT required — just monospace plain text is fine

4. **"Copy AI Prompt" button** — ghost variant, left-aligned, clipboard icon. On click, copies a pre-written prompt to clipboard and shows success toast: "AI prompt copied to clipboard". The prompt text:

   > Generate a structured roadmap in JSON format for: [YOUR GOAL HERE].
   > Use this exact structure:
   > {"title":"...","description":"...","icon":"emoji","modules":[{"title":"...","submodules":[{"title":"...","status":"not_started","checklist":["item1","item2"],"notes":["note text"]}]}]}
   > Rules: title is required for all items. status must be one of: not_started, in_progress, completed, blocked. checklist is an array of strings. notes is an array of strings. Keep it practical and actionable.

5. **"Next" button** — primary, right-aligned. Disabled until text area has content (paste) or file is uploaded.

**Behavior on "Next":**
- Parse the JSON
- If invalid JSON syntax: show inline error below the textarea in danger color, e.g., "Invalid JSON: Unexpected token at line 5, column 12". Do NOT advance to step 2.
- If valid JSON but fails schema validation: show inline error listing all validation issues, e.g., "Missing required field: modules[0].title". Do NOT advance.
- If valid: advance to Step 2.

#### Step 2: Preview

```
┌────────────────────────────────────────────────────┐
│  Import Roadmap from JSON                      [X] │
│                                                    │
│  (1) Paste JSON  ·  (2) Preview  ·  (3) Import    │
│  ─────────────────────────────────────────────── │
│                                                    │
│  🇩🇪  Germany Relocation                           │
│  "Complete plan for relocating to Berlin"          │
│                                                    │
│  ├─ Visa & Immigration                             │
│  │  ├─ Gather Documents (4 items, 1 note)          │
│  │  └─ Apply for Blue Card (4 items)               │
│  ├─ Housing                                        │
│  │  ├─ Temporary Accommodation (2 items)            │
│  │  └─ Permanent Apartment (3 items)               │
│  └─ Finance                                        │
│     └─ Open Bank Account (2 items)                 │
│                                                    │
│  Summary: 3 modules, 5 submodules, 15 items        │
│                                                    │
│  [← Back]                         [Import →]       │
└────────────────────────────────────────────────────┘
```

**Anatomy:**

1. **Roadmap header** — Icon + title (heading-lg) + description (body-sm, text-secondary)

2. **Tree preview** — Indented tree showing the hierarchy:
   - Module titles with vertical/horizontal connector lines (using `├─`, `└─`, `│` characters or styled CSS tree)
   - Under each module: submodule titles with counts in parentheses: "(4 checklist items, 1 note)"
   - Tree is scrollable if it exceeds 400px height

3. **Summary bar** — body-sm, text-secondary: "3 modules, 5 submodules, 15 checklist items, 2 notes"

4. **Footer:** "Back" (secondary, left) returns to Step 1 with the JSON preserved. "Import" (primary, right) triggers creation.

**Tree element styling:**
- Module titles: heading-md
- SubModule titles: body, indented 24px from module
- Counts: body-sm, text-tertiary, in parentheses
- Connector lines: `--color-border`, 1px

#### Step 3: Importing (in-progress state)

After clicking "Import":

- "Import" button enters loading state (spinner + "Importing...")
- "Back" button disabled
- Dialog cannot be closed during import
- A progress text updates: "Creating roadmap...", "Creating modules (2/3)...", "Creating checklist items...", "Done!"
- On success:
  - Dialog shows a brief success state: checkmark icon + "Roadmap imported successfully!"
  - Auto-closes after 1.5 seconds
  - Shows success toast
  - Navigates to the new roadmap's detail page
- On error:
  - Shows error message within the dialog: "Import failed: {reason}"
  - "Try Again" button (primary) to retry
  - "Back" button to return to Step 1

### 6.5 Export Roadmap

**Trigger:** Three-dot menu on a roadmap card (dashboard) or roadmap detail page → "Export as JSON"

**Behavior:**
- Click triggers an API call to `GET /roadmaps/:id/export`
- Brief loading state on the menu item (spinner icon replacing the download icon)
- On success: browser downloads a `.json` file named `{slugified-title}-{YYYY-MM-DD}.json`
- On error: show error toast "Failed to export roadmap"
- No dialog needed — it's a direct download action

---

## 7. Page: Roadmap Detail

**Route:** `/roadmap/:roadmapId`

**Purpose:** Shows a single roadmap. This page has **two view modes** toggled via tabs: **List View** (default, module cards) and **Visual View** (node-based flowchart preview).

### View Toggle

A tab bar or segmented control at the top of the content area, below the page header.

```
┌──────────────────────────────────────────────────┐
│ [icon]  Roadmap Title (editable)     [status ▾]  │
│ Description text (editable)                      │
│                                                  │
│ ████████████████░░░░░░  72%    4 modules         │
│                                                  │
│ [ List View ]  [ Visual View ]   [Open Editor ➜] │
│ ──────────────────────────────────────────────── │
│                                                  │
│          (List view or Visual view below)         │
└──────────────────────────────────────────────────┘
```

**Tab bar anatomy:**

| Element | Details |
|---------|---------|
| Tab items | "List View" (list icon) and "Visual View" (git-branch/workflow icon) |
| Active tab | Primary color text + bottom border (2px primary), bold |
| Inactive tab | text-secondary, no bottom border |
| "Open Editor" link | Right-aligned, ghost button, arrow-right icon. Navigates to `/roadmap/:id/editor`. Only visible when Visual tab is active. |

**Tab state:** Persisted in URL query param `?view=list` or `?view=visual`. Defaults to `list`.

### Page Header

Shared across both views. Same for List and Visual views.

**Elements:**

1. **Icon** — Same emoji as dashboard card, clickable to change
2. **Title** — heading-xl, inline-editable (click to enter edit mode, show input with save/cancel)
3. **Status dropdown** — Badge that doubles as dropdown trigger. Options: Active, Completed, Archived.
4. **Description** — body, text-secondary, inline-editable. Show "Add a description..." placeholder if empty.
5. **Progress bar** — full width, standard size, percentage on right
6. **Stats** — body-sm, text-secondary: "{N} modules"
7. **Menu** — Three-dot icon button. Options: "Edit Details" (opens dialog), "Archive", separator, "Delete Roadmap" (danger)

### List View Content

When the "List View" tab is active, show the module list and notes section (the original roadmap detail content). Also show "Add Module" button (secondary, sm, plus icon).

**Module List:** Single column, full-width module cards, 12px gap. See section 10 for module card spec.

**Roadmap-Level Notes:** Below the module list, a collapsible "Notes" section with count badge and chevron icon.

### Visual View Content

When the "Visual View" tab is active, show the embedded flowchart canvas. Full spec in section 8.

---

## 8. Page: Roadmap Visual Preview

This is the embedded visual canvas that appears within the Roadmap Detail page when the "Visual View" tab is active. It supports two modes: **Lock mode** (default) and **Edit mode**.

### 8.1 Canvas Container

**Dimensions:** Fills the remaining space below the page header + tab bar. Minimum height: 500px. On desktop with typical header, approximately `calc(100vh - 220px)`.

**Background:** Subtle dot grid pattern on `--color-bg`. Dots: 1px, `--color-border` at 30% opacity, 20px spacing.

**Border:** 1px solid `--color-border` around the canvas area, border-radius 8px.

### 8.2 Node Types

Three custom node types are rendered on the canvas.

**Roadmap Node (Root):**

```
┌─────────────────────────────┐
│  [icon]  Roadmap Title      │
│  ████████████░░░  72%       │
│  4 modules                  │
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Width | 240px |
| Padding | 16px |
| Background | `--color-primary-light` |
| Border | 2px solid `--color-primary` |
| Border radius | 8px |
| Shadow | `shadow-node` |
| Position | Top-center of the canvas (or from saved layout) |

- Always exactly one per canvas
- Not deletable, not draggable in lock mode
- Shows roadmap icon, title, progress bar, and module count

**Module Node:**

```
┌─────────────────────────────┐
│  Module Title               │
│  ██████░░░░  55%            │
│  3 submodules               │
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Width | 200px |
| Padding | 12px |
| Background | `--color-bg` |
| Border | 2px solid (color based on progress — see below) |
| Border radius | 8px |
| Shadow | `shadow-node` |

- Border color: `--color-border` (0%), `--color-warning` (1-99%), `--color-success` (100%)
- Shows title (heading-md, single line, truncate), compact progress bar, submodule count (caption)
- **Source handle:** Bottom center (for edges going to submodules)
- **Target handle:** Top center (for edge from roadmap node)

**SubModule Node:**

```
┌─────────────────────────────┐
│  ● SubModule Title          │
│  [In Progress]    40%       │
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Width | 180px |
| Padding | 10px 12px |
| Background | `--color-bg` |
| Border | 2px solid (status color) |
| Border radius | 6px |
| Shadow | `shadow-node` |

- Border and status dot color mapped to status:
  - `not_started` → `--color-border` (gray)
  - `in_progress` → `--color-warning` (amber)
  - `completed` → `--color-success` (green)
  - `blocked` → `--color-danger` (red)
- Shows: status dot (8px circle), title (body, single line, truncate), status badge (caption), progress percentage
- **Target handle:** Top center (for edge from parent module)
- If due date exists and is overdue: small warning icon next to title

**Selected state (all node types):**
- Shadow changes to `shadow-node-selected` (primary color ring)
- Slightly elevated appearance

### 8.3 Edges

**Default edge style:**

| Property | Value |
|----------|-------|
| Type | `smoothstep` (rounded right-angle connectors) |
| Stroke color | `--color-border` |
| Stroke width | 2px |
| Animated | No (static) |

**Edge from Roadmap → Module:** Exits bottom of roadmap node, enters top of module node.
**Edge from Module → SubModule:** Exits bottom of module node, enters top of submodule node.

**Selected edge:** Stroke becomes `--color-primary`, width 2.5px.

### 8.4 Canvas Controls

Floating controls overlaid on the canvas.

**Minimap (bottom-right corner):**

| Property | Value |
|----------|-------|
| Width | 160px |
| Height | 100px |
| Border | 1px solid `--color-border` |
| Background | `--color-surface` at 90% opacity |
| Border radius | 6px |
| Node colors | Match the node border colors (status-based) |

**Zoom controls (bottom-left corner):**
- Vertical stack of 3 icon buttons: zoom-in (+), zoom-out (-), fit-to-view (maximize icon)
- Each: 32px square, `--color-bg` background, `--color-border` border, 6px radius
- Tooltip on hover

**Lock/Edit mode toggle (top-right of canvas, inside the canvas area):**

```
┌──────────────────────┐
│  🔒 Lock  |  ✏️ Edit  │
└──────────────────────┘
```

- Segmented control / toggle button group
- Active segment: primary background, white text
- Inactive segment: `--color-surface` background, text-secondary
- Height: 32px, border-radius 6px
- Default: Lock mode active

### 8.5 Lock Mode Behavior

This is the default, read-only interaction mode.

**Allowed interactions:**
- Pan: click-and-drag on empty canvas space
- Zoom: mouse wheel, pinch, or zoom buttons
- Click node: opens SubModule detail panel (section 11) for SubModule nodes. For Module nodes, shows a tooltip/popover with module summary (title, progress, submodule list).
- Right-click SubModule node: opens context menu (section 3.11) with status options: "Not Started", "In Progress", "Completed", "Blocked". Current status shown with checkmark. Selecting a new status updates it immediately (optimistic).
- Hover node: subtle lift effect (translateY -1px, shadow-md)

**Disabled interactions:**
- Cannot drag/move nodes
- Cannot add or delete nodes
- Cannot create or delete edges
- Cannot edit node titles
- No drag handles visible on nodes

### 8.6 Edit Mode Behavior

Toggled via the Lock/Edit control. Allows structural modifications.

**All Lock mode interactions still work** plus:

- **Drag nodes:** Click and drag any node to reposition. Snap to a 10px grid for alignment. Connected edges follow the node smoothly.
- **Inline edit:** Double-click a node title to edit it. Input appears in place. Enter saves, Escape cancels.
- **Add node:** Double-click empty canvas space. A small popup appears at the click position:
  - Two options: "Add Module" / "Add SubModule"
  - Selecting one creates the entity in the database AND places a new node at that position
  - New Module node: appears with "Untitled Module" title in edit mode (auto-focused for naming)
  - New SubModule: prompts to select a parent Module first (dropdown if not obvious from click location near a module), then creates
- **Delete node:** Select a node, then press Delete/Backspace key. Or right-click → "Delete". Shows confirmation dialog. Deletes the underlying entity from the database (cascade for modules).
- **Create edge:** Hover a node to reveal its handle dots. Drag from a source handle (bottom) to a target handle (top) of another node. Only valid connections: Roadmap→Module, Module→SubModule.
- **Delete edge:** Click an edge to select it. Press Delete. Or right-click the edge → "Remove connection".

**Visual indicators in Edit mode:**
- Nodes show a subtle dashed border instead of solid (indicating they're editable)
- Node handles (connection points) visible as small circles on top/bottom of nodes
- Cursor changes to `move` when hovering draggable nodes

**Dirty state:** When any change is made (node moved, added, deleted, edge changed), show a "Unsaved changes" indicator near the mode toggle. Changes are NOT auto-saved in the embedded preview (only in the dedicated editor).

**Save:** A "Save Layout" button appears next to the mode toggle when dirty. Click saves all positions/edges via the layout API.

---

## 9. Page: Roadmap Visual Editor

**Route:** `/roadmap/:roadmapId/editor`

**Purpose:** A full-screen, dedicated canvas editing experience. Same canvas as section 8 but with more space, a proper toolbar, auto-save, and undo/redo.

### 9.1 Layout

This page uses the **Editor Layout** (section 4.1) — no sidebar, no standard TopBar.

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Roadmap   Roadmap Title   [Save ✓] [⋮ more]  │  ← EditorToolbar
├──────────────────────────────────────────────────────────┤
│                                                           │
│                                                           │
│              Full-Screen Canvas                           │
│              (same nodes, edges, interactions             │
│               as section 8 Edit mode)                     │
│                                                           │
│                                                           │
│                            [minimap]                      │
│                 [zoom]                                    │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Editor Toolbar

**Height:** 48px, full width, sticky top, z-index 10.

**Background:** `--color-bg` with bottom border.

**Left section:**
- Back arrow icon + "Back to Roadmap" text link — navigates to `/roadmap/:id`. If unsaved changes, show confirm dialog: "You have unsaved changes. Discard?"
- Separator (vertical line, 20px tall, `--color-border`)
- Roadmap title — heading-md, non-editable here (just for context)

**Center section:**
- **Undo** — icon button (undo icon), ghost. Disabled when no undo history. Tooltip: "Undo (Ctrl+Z)"
- **Redo** — icon button (redo icon), ghost. Disabled when no redo history. Tooltip: "Redo (Ctrl+Shift+Z)"
- Separator
- **Auto-layout** — icon button (layout/align icon) + "Auto Layout" text, ghost. Tooltip: "Arrange nodes automatically". Triggers dagre layout recalculation.
- Separator
- **Zoom out** — icon button, ghost
- **Zoom level** — text showing current zoom percentage (e.g., "100%"), clickable to reset to 100%
- **Zoom in** — icon button, ghost
- **Fit view** — icon button (maximize), ghost

**Right section:**
- **Save status indicator:**
  - "All changes saved" — text-secondary, checkmark icon (when clean)
  - "Saving..." — text-secondary, spinner icon (during save)
  - "Unsaved changes" — warning color text, dot indicator (when dirty)
  - "Save failed" — danger color, retry icon (on save error, clickable to retry)
- **Save button** — primary, sm. Disabled when no changes. Shows loading state during save.
- **More menu** (three-dot) — Options: "Export as image" (P2), "Reset layout" (danger, re-runs auto-layout from scratch)

### 9.3 Canvas Behavior (Editor-Specific)

The canvas uses the same React Flow instance and node types as section 8, but always in **Edit mode** (no Lock/Edit toggle — the editor is always editable).

**Additional features over the embedded preview:**

**Auto-save:**
- After any change (node move, add, delete, edge change), start a 30-second debounce timer
- If another change happens within 30s, reset the timer
- When the timer fires, auto-save via PUT layout API
- Update save status indicator accordingly
- On page unload/navigation with unsaved changes: show browser `beforeunload` confirm

**Undo/Redo:**
- Maintain an undo stack of layout states (up to 50 entries)
- Each stack entry is a snapshot of `{ nodes, edges }` positions
- Undo reverts to previous snapshot, Redo moves forward
- Stack is cleared on page load (fresh from server)
- Keyboard: Ctrl+Z (undo), Ctrl+Shift+Z (redo)

**Auto-layout (dagre):**
- On trigger: calculates optimal positions for all nodes using a top-down tree layout
- Direction: top-to-bottom (TB)
- Node spacing: 60px horizontal, 80px vertical
- After calculation: animate all nodes smoothly to their new positions (500ms ease)
- Auto-layout does NOT auto-save — user sees the result and can undo if they don't like it
- If no layout exists yet (first time opening visual view), auto-layout runs automatically

**Node creation in editor:**
- In addition to double-click, the toolbar can have a "+ Add" dropdown: "Add Module", "Add SubModule"
- New nodes appear at center of current viewport
- Module nodes are automatically connected to the Roadmap root node
- SubModule nodes prompt for parent Module selection, then auto-connect

**Keyboard shortcuts (editor-specific):**
- `Delete` / `Backspace` — delete selected node or edge
- `Ctrl+Z` — undo
- `Ctrl+Shift+Z` — redo
- `Ctrl+S` — save layout
- `Ctrl+A` — select all nodes
- `Escape` — deselect all
- `Space` (hold) — temporary pan mode (hand cursor)
- `+` / `-` — zoom in/out
- `Ctrl+0` — fit view

### 9.4 First-Time Experience

When a roadmap has no saved layout (new roadmap, never opened in visual view):

1. Fetch all modules and submodules from the existing data
2. Create nodes for each entity with temporary positions
3. Run auto-layout (dagre) to arrange them
4. Display the result on canvas
5. Show a subtle toast: "Layout auto-generated from your roadmap structure"
6. The layout is NOT saved until the user explicitly saves or auto-save triggers

### 9.5 Sync Between List View and Visual View

When entities are created, updated, or deleted in the **list view** (modules, submodules via the module cards):

- **Created:** Next time the visual view loads, detect entities without corresponding nodes. Auto-create nodes at a default position (below their parent, or run incremental auto-layout for just the new nodes).
- **Deleted:** Nodes referencing deleted entities are cleaned up on layout load. Orphaned edges are removed.
- **Status/progress updated:** Node appearance updates automatically via TanStack Query cache (no layout re-fetch needed — nodes derive status from entity data).
- **Title updated:** Node title reflects the entity title from cache (not stored in layout).

This means the `RoadmapLayout` only stores **positions and edges**, not entity data. Entity data (title, status, progress) is always read from the modules/submodules cache.

---

## 10. Page: Module Detail

Modules are displayed as expandable cards within the Roadmap Detail page's **List View**. There is no separate route for a module — everything happens in-place.

### 10.1 Module Card (Collapsed)

```
┌──────────────────────────────────────────────────┐
│ ⠿  Module Title                 65%  ████████░░  │
│    3 submodules                            [⋮]   │
└──────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Padding | 16px |
| Border | 1px solid `--color-border` |
| Border radius | 8px |
| Background | `--color-bg` |

**Elements:**

1. **Drag handle** — 6-dot grip icon, left side. Visible on hover (desktop) or always visible (mobile). Cursor: grab.
2. **Title** — heading-md, inline-editable
3. **Progress** — Percentage text + compact progress bar (120px wide), right side
4. **SubModule count** — body-sm, text-secondary
5. **Menu trigger** — Three-dot, right side. Options: "Edit", separator, "Delete" (danger)
6. **Expand/Collapse** — Clicking anywhere on the card (except drag handle & menu) toggles expanded state

**Expanded indicator:** Chevron rotates 90 degrees when expanded.

### 10.2 Module Card (Expanded)

When expanded, the card stretches to reveal its submodules.

```
┌──────────────────────────────────────────────────┐
│ ⠿  Module Title                 65%  ████████░░  │
│    3 submodules                            [⋮]   │
│ ─────────────────────────────────────────────── │
│                                                  │
│    ┌─ SubModule Card ──────────────────────────┐ │
│    │  ...                                      │ │
│    └───────────────────────────────────────────┘ │
│    ┌─ SubModule Card ──────────────────────────┐ │
│    │  ...                                      │ │
│    └───────────────────────────────────────────┘ │
│                                                  │
│    [+ Add SubModule]                             │
│                                                  │
│    ▸ Notes (1)                                   │
└──────────────────────────────────────────────────┘
```

**Inside expanded area:**
1. Thin separator line
2. SubModule cards (see 10.3), vertically stacked, 8px gap, 16px left indent
3. "Add SubModule" button — ghost variant, sm size, plus icon + text, at bottom of submodule list
4. Module-level notes section (collapsible, same pattern as roadmap-level notes)

**Animation:** Expand/collapse with height transition (200ms ease). Content fades in (150ms).

### 10.3 SubModule Card (within Module)

```
┌──────────────────────────────────────────────────┐
│ ⠿  SubModule Title        [In Progress]   [⋮]   │
│    ██████░░░░  40%         Due: Feb 20            │
└──────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Padding | 12px 16px |
| Border | 1px solid `--color-border` |
| Border radius | 6px |
| Background | `--color-bg` |
| Hover | `--color-surface-hover` background |

**Elements:**

1. **Drag handle** — grip icon, left
2. **Title** — heading-md
3. **Status badge** — Appropriate variant badge (not_started, in_progress, completed, blocked)
4. **Menu** — Three-dot. Options: "Edit", separator, "Delete" (danger)
5. **Progress bar** — compact (100px), with % label
6. **Due date** — body-sm, text-secondary. If overdue: danger color + small warning icon

**Click behavior:** Clicking the submodule card (except drag/menu) opens the SubModule Detail panel (section 11).

### 10.4 Add Module Interaction

**Trigger:** "Add Module" button on roadmap detail page header.

**Behavior — Inline creation (preferred over dialog):**
1. A new empty card appears at the bottom of the module list
2. Title field is an input, auto-focused
3. User types the title and presses Enter to save, or Escape to cancel
4. On save: the card transitions from "editing" to "normal" state
5. On cancel: the empty card is removed

**Alternative:** If the inline pattern feels too complex, use a small dialog with just a title input.

### 10.5 Add SubModule Interaction

Same inline pattern as Add Module, but within the expanded module card.

---

## 11. Panel: SubModule Detail

**Trigger:** Click a SubModule card (list view) or click a SubModule node (visual view).

**Type:** Slide-over panel from the right edge of the screen.

### Panel Layout

| Property | Value |
|----------|-------|
| Width | 560px (desktop), 100% (mobile) |
| Height | Full viewport height |
| Background | `--color-bg` |
| Shadow | `shadow-lg` on the left edge |
| Z-index | 45 |

**Backdrop:** Semi-transparent overlay on the main content (like dialog but only covering the main area, not the sidebar).

### Panel Anatomy

```
┌──────────────────────────────────────┐
│  ← Back    SubModule Title     [⋮]   │  ← Panel header
│ ──────────────────────────────────── │
│                                      │
│  Status: [In Progress ▾]            │
│  Due:    [Feb 20, 2026  ✕]          │
│                                      │
│  ─── Checklist (3/5) ────────────── │
│  [x] Item one                        │
│  [ ] Item two                        │
│  [ ] Item three                      │
│  [x] Item four                       │
│  [ ] Item five                       │
│  [+ Add item...]                     │
│                                      │
│  ─── Notes ──────────────────────── │
│  [TipTap editor area]               │
│                                      │
│  ─── Files (2) ──────────────────── │
│  📄 document.pdf    120KB    [⬇ ✕]  │
│  🖼️ screenshot.png   45KB    [⬇ ✕]  │
│  [Upload file zone]                  │
│                                      │
└──────────────────────────────────────┘
```

### Panel Header

- **Back arrow** — icon button, left. Closes the panel.
- **Title** — heading-lg, inline-editable
- **Menu** — Three-dot. Options: "Delete SubModule" (danger)

### Panel Sections

The panel body scrolls vertically. Sections are stacked:

1. **Metadata strip** — Status dropdown + due date picker, inline, side by side
2. **Checklist section** — Header "Checklist" + completion count. Full spec in section 12.
3. **Notes section** — Header "Notes". Full spec in section 13.
4. **Files section** — Header "Files" + count. Full spec in section 14.

Each section has a thin separator line (1px `--color-border`) above it.

### Panel Behavior

- Opens with slide-in from right (300ms ease)
- Closes with slide-out to right (200ms ease)
- Close triggers: back arrow, Escape key, backdrop click
- Panel is scrollable if content exceeds viewport
- URL does not change when panel opens (panel state is client-side only)
- If user navigates away (e.g., clicks sidebar), panel auto-closes
- When opened from visual view: panel overlays the canvas. Canvas is still partially visible but non-interactive behind the backdrop.

---

## 12. Feature: Checklist

Lives inside the SubModule Detail panel (section 11). This is the most interactive part of the UI.

### Checklist Header

"Checklist" label (heading-md) + completion count as text: "(3/5 completed)" in body-sm, text-secondary.

Compact progress bar (full width, 4px height) directly below the header.

### Checklist Item

```
┌──────────────────────────────────────┐
│ ⠿  [x]  Item title text         [🗑] │
└──────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| Drag handle | 6-dot grip, visible on hover. For reorder. |
| Checkbox | 18px square, rounded 4px. Checked: primary fill + white checkmark. Unchecked: border only. |
| Title | body size. If completed: `--color-text-secondary` + strikethrough. Click to edit inline. |
| Delete | Trash icon, ghost danger, visible on hover only. No confirmation needed. |

**Item height:** 40px per row, 4px gap between items.

**Completed items:** Visual deemphasis — lighter text, strikethrough. Do NOT move them to bottom. Keep them in their original position.

### Add Checklist Item

Below the last item, a persistent input row:

```
┌──────────────────────────────────────┐
│      [ ]  Add an item...             │
└──────────────────────────────────────┘
```

- Looks like a checklist item but with placeholder text
- On focus/click: becomes a real input
- Press **Enter**: saves the item, clears the input, refocuses the input for rapid sequential entry
- Press **Escape**: blurs the input, clears text
- Empty submit: ignored (no empty items)

### Inline Edit

- Click on an existing item's title text
- Title transforms into an input with the current text selected
- **Enter**: saves changes
- **Escape**: reverts to original text
- Click away (blur): saves changes

### Optimistic UI

- Toggle: Checkbox flips instantly on click. If API fails, revert and show error toast.
- Add: New item appears instantly with a temporary ID. Replaced with server ID on success.
- Delete: Item removed instantly. If API fails, item reappears with error toast.
- Reorder: Items rearrange instantly during drag. Persist on drop. Revert if API fails.

### Progress Recalculation

Every toggle, add, or delete triggers an immediate recalculation of:
1. The checklist progress bar in the panel
2. The SubModule card progress in the module view (list)
3. The SubModule node appearance in the visual view (color/progress)
4. The Module progress in the roadmap view
5. The Roadmap overall progress on the dashboard

This recalculation happens **client-side** (computed from the cached checklist data), not via a separate API call. The visual view nodes re-derive their appearance from the TanStack Query cache.

---

## 13. Feature: Notes (TipTap)

Notes appear in three places: SubModule detail panel, Module expanded card, and Roadmap detail page.

### Notes Section Layout

**Header:** "Notes" label + count badge if > 0.

**If no notes exist:** Show a subtle CTA: "Add a note to keep track of important details." + "Add Note" ghost button.

**If notes exist:** Vertically stacked note cards + "Add Note" button at top or bottom.

### Note Card (Read Mode)

```
┌──────────────────────────────────────┐
│  Note content preview (rich text)    │
│  rendered as HTML...                 │
│                                      │
│  Updated 2 hours ago        [✏️] [🗑] │
└──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Padding | 12px 16px |
| Border | 1px solid `--color-border` |
| Border radius | 6px |
| Background | `--color-surface` |

**Elements:**
- Rich text content rendered from TipTap HTML output
- Timestamp (body-sm, text-tertiary) bottom-left
- Edit icon button (ghost) — switches to edit mode
- Delete icon button (ghost danger) — opens confirm dialog

### Note Card (Edit Mode)

The card expands to show the full TipTap editor.

### TipTap Editor

**Toolbar (sticky at top of editor):**

Row of icon buttons, grouped by function with subtle separators:

| Group | Actions |
|-------|---------|
| Text | Bold (B), Italic (I), Strikethrough (S) |
| Headings | H1, H2, H3 (dropdown or toggles) |
| Lists | Bullet list, Ordered list |
| Blocks | Blockquote, Code block |
| Insert | Link (opens small inline URL input) |

**Toolbar appearance:**
- Height: 40px
- Background: `--color-surface`
- Border bottom: 1px `--color-border`
- Active format buttons: primary-light background

**Editor area:**
- Min height: 120px (expandable as content grows)
- Max height: 400px (then scrolls internally)
- Padding: 12px
- Placeholder: "Write your notes here..."
- Focus ring: same as input

**Footer:**
- "Save" button (primary, sm) + "Cancel" text button
- Or: auto-save on blur with a "Saving..." indicator

**Behavior:**
- New note: shows empty editor. Save creates the note.
- Edit note: shows editor pre-filled. Save updates.
- Cancel: reverts to read mode without saving
- Rich text output stored as HTML string

### TipTap Rendering

When displaying saved notes in read mode, render the stored HTML within a styled container that applies proper typography:
- Headings use the design system heading sizes
- Lists have proper indentation and bullets/numbers
- Code blocks have a `--color-surface` background and monospace font
- Links are primary color and underlined
- Blockquotes have a left border (3px, primary color) and left padding

---

## 14. Feature: File Upload

Files attach only to SubModules. This section lives in the SubModule Detail panel.

### Files Section Header

"Files" label (heading-md) + count in parentheses.

### File List

Vertical list of file rows.

**File Row:**

```
┌──────────────────────────────────────┐
│  [icon]  filename.pdf   120 KB       │
│          Uploaded Feb 10     [⬇] [🗑] │
└──────────────────────────────────────┘
```

| Element | Details |
|---------|---------|
| File type icon | Based on MIME type: PDF icon, image icon, document icon, spreadsheet icon, generic file icon |
| File name | body, truncate with ellipsis if long |
| File size | body-sm, text-secondary. Format: KB/MB |
| Upload date | body-sm, text-tertiary, relative time |
| Download button | ghost icon button (download icon). Triggers presigned URL fetch + download. |
| Delete button | ghost danger icon button (trash). Opens confirm dialog. |

**Row height:** Auto (approximately 56px). Gap: 4px.

### Upload Zone

Below the file list, a drop zone.

**Default state:**

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                                      │
│    [upload icon]                     │
│    Drop files here or click          │
│    to upload (max 10MB)              │
│                                      │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

| Property | Value |
|----------|-------|
| Border | 2px dashed `--color-border` |
| Border radius | 8px |
| Background | transparent |
| Padding | 24px |
| Text | body-sm, text-secondary, centered |

**Drag-over state:** Border becomes `--color-primary`, background becomes `--color-primary-light`.

**Uploading state:**
- Replace the zone content with a progress indicator
- Show file name being uploaded
- Show upload progress bar (actual progress from XHR upload or indeterminate)
- "Cancel" link to abort

**Validation (client-side, before upload):**
- Max 10MB per file. If exceeded: shake the zone + show error toast "File too large (max 10MB)"
- Allowed types: pdf, png, jpg, jpeg, webp, doc, docx, xls, xlsx, txt. If wrong type: error toast.

**Post-upload behavior:**
- New file row appears in the list (optimistic)
- Success toast: "File uploaded"
- If upload fails: remove optimistic row, show error toast

### Download Behavior

- Click download icon
- API returns a presigned URL
- Browser triggers download via the signed URL (temporary link, no permanent exposure)
- Brief loading state on the download icon during URL fetch

---

## 15. Feature: Drag-and-Drop

Drag-and-drop applies to three entities in the **list view**: Modules (within a roadmap), SubModules (within a module), and Checklist items (within a submodule). The visual canvas has its own node-drag system via React Flow (section 8.6).

### General DnD Behavior (List View)

| Aspect | Rule |
|--------|------|
| Library | @dnd-kit |
| Constraint | Items can ONLY be reordered within their parent container. No cross-container moves. |
| Activation | Mouse: press and hold drag handle for 100ms (prevents accidental drags). Touch: press and hold 200ms. |
| Cursor | `grab` on handle hover, `grabbing` during drag |
| Drop indicator | Thin horizontal line (2px, primary color) between items showing drop position |

### Drag Overlay

While dragging, the original item stays in place at reduced opacity (30%). A **drag overlay** (clone of the card) follows the cursor.

| Property | Value |
|----------|-------|
| Opacity | 95% |
| Shadow | `shadow-lg` |
| Scale | 1.02 (slightly enlarged) |
| Border | 2px solid primary |

### Module Reorder

- Drag handle on the left of each module card
- Drag constraint: vertical only, within the module list
- On drop: update all affected module `order` values via the reorder API
- Optimistic: list rearranges immediately

### SubModule Reorder

- Drag handle on the left of each submodule card within an expanded module
- Constraint: vertical, within that module only (cannot drag into another module)
- Same optimistic pattern

### Checklist Reorder

- Drag handle on the left of each checklist item in the SubModule detail panel
- Constraint: vertical, within the checklist
- Lighter visual — no card overlay, just the item row moves
- Especially important: feels fast and fluid for short lists

### Keyboard DnD

- Focus drag handle with Tab
- Press Space/Enter to pick up item
- Arrow Up/Down to move position
- Space/Enter to drop
- Escape to cancel

### Performance

- Use the DnD kit's `restrictToVerticalAxis` modifier
- Use `restrictToParentElement` to prevent items from being dragged outside their container
- Avoid re-rendering the entire list during drag — only the moving item and the gap indicator should update

---

## 16. State Management Strategy

### What Goes Where

| State Type | Tool | Examples |
|-----------|------|---------|
| **Server state** | TanStack Query | Roadmaps, modules, submodules, checklist items, notes, files, roadmap layout |
| **UI state** | Zustand | Sidebar open/closed, active dialog, current theme, slide-over panel, active view tab |
| **Canvas state** | React Flow internal + Zustand | Node positions (during editing), viewport, undo/redo stack, dirty flag |
| **Form state** | Local component state | Input values, validation errors, form dirty status |
| **URL state** | Next.js router | Current roadmap ID, module ID, view tab (route params + query params) |

### TanStack Query Cache Keys

Use consistent, hierarchical cache keys:

| Entity | Key Pattern |
|--------|------------|
| All roadmaps | `["roadmaps"]` |
| Single roadmap | `["roadmaps", roadmapId]` |
| Modules for roadmap | `["modules", { roadmapId }]` |
| SubModules for module | `["submodules", { moduleId }]` |
| Checklist for submodule | `["checklist", { subModuleId }]` |
| Notes for entity | `["notes", { entityType, entityId }]` |
| Files for submodule | `["files", { subModuleId }]` |
| Layout for roadmap | `["layout", { roadmapId }]` |

### Invalidation Rules

After a mutation, invalidate related queries:

| Mutation | Invalidate |
|----------|-----------|
| Create/delete roadmap | `["roadmaps"]` |
| Update roadmap | `["roadmaps"]`, `["roadmaps", id]` |
| Create/delete module | `["modules", { roadmapId }]`, `["roadmaps", roadmapId]` |
| Create/delete submodule | `["submodules", { moduleId }]`, `["modules", { roadmapId }]` |
| Toggle/add/delete checklist item | `["checklist", { subModuleId }]`, `["submodules", { moduleId }]`, `["modules", { roadmapId }]` |
| Create/delete note | `["notes", { entityType, entityId }]` |
| Upload/delete file | `["files", { subModuleId }]` |
| Save layout | `["layout", { roadmapId }]` |
| Create/delete module or submodule (from visual editor) | Same as above + `["layout", { roadmapId }]` (layout will need orphan cleanup) |

### Zustand Store Shape

```
UIStore:
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeDialog: null | { type: string, data?: any }
  activePanel: null | { subModuleId: string, moduleId: string, roadmapId: string }
  activeViewTab: 'list' | 'visual'
  theme: 'light' | 'dark' | 'system'

EditorStore:
  isDirty: boolean
  undoStack: LayoutSnapshot[]
  redoStack: LayoutSnapshot[]
  lastSavedAt: Date | null
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'
```

Keep it minimal. If it comes from the server, it belongs in TanStack Query, not Zustand.

---

## 17. Data Fetching Patterns

### Server Components vs. Client Components

| What | Render Strategy | Reason |
|------|----------------|--------|
| App shell (sidebar, topbar) | Server component | Static layout, fetches roadmap list for sidebar |
| Dashboard page | Server component (initial) + Client (interactions) | Initial roadmap list can be SSR'd |
| Roadmap detail page | Server component (initial) + Client (interactions) | Initial data SSR'd for fast LCP |
| Visual preview canvas | Client component | React Flow requires client-side rendering, heavy interactivity |
| Visual editor page | Client component | Fully interactive canvas, no SSR benefit |
| SubModule panel | Client component | Opened dynamically, no route |
| All forms/dialogs | Client component | Highly interactive |
| Checklist, notes, files | Client component | Frequent mutations, optimistic updates |

### Prefetching

- On the dashboard, when hovering a roadmap card for 300ms, prefetch that roadmap's detail data (modules + submodules). This makes navigation feel instant.
- On the roadmap detail page, module data is fetched alongside the roadmap (single API call returns roadmap + modules).
- When switching from "List View" to "Visual View" tab, the layout data is fetched. Prefetch layout data when hovering the "Visual View" tab for 200ms.
- On the visual editor page load, fetch layout + all modules + all submodules in parallel.

### Optimistic Updates Pattern

For every mutation that should feel instant:

1. **Before API call:** Update the TanStack Query cache directly with the expected new state
2. **On API success:** Replace optimistic data with server response (usually a no-op if data matches)
3. **On API error:** Roll back cache to previous state + show error toast

Apply optimistic updates to: checklist toggle, checklist add, checklist delete, reorder operations, status changes, node status toggle (visual view).

Do NOT apply optimistic updates to: roadmap create/delete, note save (too complex to predict server response for rich text), file upload (depends on S3), layout save (debounced, not user-facing latency).

### Loading Strategy Per Page

| Page | Initial Load | Subsequent |
|------|-------------|------------|
| Dashboard | Skeleton grid (6 cards) | Instant from cache |
| Roadmap detail (list) | Skeleton header + skeleton module list | Prefetched from hover |
| Roadmap detail (visual) | Canvas with loading spinner centered, "Loading layout..." text | Cached after first load |
| Visual editor | Full-screen canvas with centered spinner | Parallel fetch of layout + entities |
| SubModule panel | Spinner in panel while fetching checklist/notes/files | Cached after first open |

---

## 18. Responsive Behavior

### Breakpoints

| Name | Range | Sidebar | Layout Changes |
|------|-------|---------|---------------|
| Mobile | < 768px | Hidden (overlay) | Single column, full-width panels |
| Tablet | 768px - 1023px | Collapsed (64px) | 2-column grid, narrower panels |
| Desktop | 1024px+ | Full (240px) | 3-column grid, 560px slide-over |

### Per-Component Responsive Rules

**TopBar:**
- Mobile: Logo + hamburger (left), avatar (right). No breadcrumb.
- Desktop: Logo + breadcrumb (left), avatar (right).

**Sidebar:**
- Mobile: Hidden by default. Hamburger opens as overlay (full height, 280px wide). Backdrop behind.
- Tablet: Collapsed to 64px (icon-only). Expand on hover or toggle.
- Desktop: Full 240px.

**Dashboard Grid:**
- Mobile: 1 column, cards full width
- Tablet: 2 columns
- Desktop: 3 columns

**Roadmap Detail - View Toggle Tabs:**
- All breakpoints: tabs remain visible. On mobile, they stretch full-width.
- "Open Editor" link is icon-only on mobile (no text).

**Roadmap Detail - Module List:**
- Same at all breakpoints (single column, full width). Cards adapt naturally.

**Visual Preview Canvas (embedded):**
- Desktop: fills available content area (~calc(100vw - 240px - 48px) wide)
- Tablet: fills content area with collapsed sidebar
- Mobile: full width. Minimum height 400px. Minimap hidden. Zoom controls simplified to just fit-view button.

**Visual Editor Page (full-screen):**
- All breakpoints: full viewport (no sidebar). Toolbar adapts:
  - Desktop: full toolbar with all buttons and labels
  - Tablet: toolbar compresses — labels hidden, icon-only buttons
  - Mobile: toolbar becomes two rows — top row: back + title + save, bottom row: tools. Or use a collapsible toolbar menu.

**SubModule Detail Panel:**
- Desktop: 560px slide-over from right
- Tablet: 480px slide-over
- Mobile: Full-screen overlay (100% width, 100% height). Back arrow becomes prominent. No backdrop — replaces the screen.

**Dialogs:**
- Desktop: Centered, max-width as specified
- Mobile: Full-screen bottom sheet (slides up from bottom, rounded top corners, full width)

**Checklist Items:**
- Mobile: drag handle always visible (no hover state on touch)
- Delete button always visible on mobile (no hover to reveal)

**File Upload Zone:**
- Mobile: Same appearance but reduce padding. "Click to upload" is the primary interaction (drag-and-drop is less common on mobile).

**Toast Notifications:**
- Mobile: Full width (minus 16px margins), bottom of screen

**Canvas Node Context Menu:**
- Mobile: opens as a bottom sheet instead of a floating menu at cursor position

---

## 19. Loading, Empty & Error States

Every data-driven area of the UI needs all three states defined. Do not skip any.

### 19.1 Loading States

| Location | Loading Treatment |
|----------|------------------|
| Dashboard grid | 6 skeleton cards in grid layout |
| Roadmap header | Skeleton: 1 line for title (60% width), 1 line for description (90% width), skeleton progress bar |
| Module list | 3 skeleton module cards |
| Visual preview canvas | Canvas area with centered spinner + "Loading visual layout..." text below |
| Visual editor | Full-screen centered spinner + "Loading editor..." text |
| SubModule panel - checklist | 4 skeleton lines (alternating 70% and 85% width) |
| SubModule panel - notes | 1 skeleton block (full width, 80px height) |
| SubModule panel - files | 2 skeleton file rows |
| Sidebar roadmap list | 4 skeleton lines (icon + text) |

### 19.2 Empty States

Each empty state needs: an illustration or icon, a headline, a description, and a CTA button.

| Location | Icon | Headline | Description | CTA |
|----------|------|----------|-------------|-----|
| Dashboard (no roadmaps) | Map/Route icon (48px, text-tertiary) | "No roadmaps yet" | "Create your first roadmap or import one from JSON." | "Create Roadmap" (primary) + "Import JSON" (secondary, below) |
| Roadmap detail (no modules) | Layers icon | "No modules" | "Break your roadmap into modules to organize your plan." | "Add Module" (secondary) |
| Visual preview (no nodes/layout) | GitBranch icon | "No visual layout yet" | "Switch to Edit mode or open the Editor to arrange your roadmap visually." | "Open Editor" (primary) or "Switch to Edit Mode" (secondary) |
| Module expanded (no submodules) | List icon | "No submodules" | "Add submodules to track specific tasks." | "Add SubModule" (ghost) |
| Checklist (no items) | CheckSquare icon | "No checklist items" | "Add items to track your progress." | Focus the add-item input |
| Notes (no notes) | FileText icon | "No notes yet" | "Add notes to document important details." | "Add Note" (ghost) |
| Files (no files) | Upload icon | "No files attached" | "Upload documents, images, or spreadsheets." | Activate the upload zone |

**Styling for empty states:**
- Center-aligned within the container
- Icon: 48px, `--color-text-tertiary`
- Headline: heading-md, `--color-text-primary`
- Description: body-sm, `--color-text-secondary`, max-width 320px
- Vertical spacing: 8px between icon and headline, 4px between headline and description, 16px before CTA

### 19.3 Error States

**Page-level error (API failure loading page data):**
- Centered content with alert-circle icon (48px, danger color)
- "Something went wrong" heading
- "Failed to load {resource}. Please try again." description
- "Retry" button (primary) — refetches the query

**Canvas error (layout failed to load):**
- Show error within the canvas area (not a full-page error)
- Same centered pattern but inside the canvas bounds
- "Retry" refetches the layout query only

**Inline error (mutation failure):**
- Toast notification with error variant
- Optimistic changes rolled back silently
- The UI returns to its pre-mutation state

**Layout save error:**
- Save status indicator shows "Save failed" in danger color
- Clickable to retry
- Toast: "Failed to save layout. Click to retry."
- Do NOT lose the user's changes — keep the dirty state in memory

**Network offline:**
- Show a thin banner at the top of the page (below topbar): "You're offline. Changes will sync when you reconnect." — amber background, body-sm.
- Disable mutation buttons (faded, no pointer events)
- In the visual editor: disable auto-save, show "Offline — changes saved locally" indicator

---

## 20. Accessibility Checklist

Follow these for every component built.

### General

- All interactive elements (buttons, links, inputs, checkboxes) must be focusable via Tab key
- Focus order follows visual order (left-to-right, top-to-bottom)
- Visible focus indicator: 2px solid ring (`--color-border-focus`) with 2px offset
- No information conveyed by color alone (always pair with text or icon)

### Specific Components

| Component | Requirements |
|-----------|-------------|
| Buttons | `aria-label` on icon-only buttons (e.g., "Delete item", "Open menu") |
| Dialogs | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title. Focus trapped. |
| Dropdown menus | `role="menu"`, items have `role="menuitem"`. Arrow key navigation. |
| Context menus | Same as dropdowns. Announced via `aria-haspopup="menu"` on triggering node. |
| Progress bars | `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` |
| Checkboxes | `role="checkbox"`, `aria-checked`. Label associated. |
| Toast | `role="alert"`, `aria-live="polite"` for info/success, `aria-live="assertive"` for errors |
| Slide-over panel | `role="dialog"`, focus trapped while open |
| Drag handles | `aria-roledescription="sortable"`, instructions announced on focus |
| Skeleton | `aria-hidden="true"` (decorative loading indicator) |
| Breadcrumb | `nav` element with `aria-label="Breadcrumb"`, current page with `aria-current="page"` |
| Canvas (React Flow) | `role="application"` with `aria-label="Roadmap visual editor"`. Nodes are focusable. Announce node type and status on focus. |
| Canvas nodes | `role="button"` or `role="treeitem"`. `aria-label` includes node title + status. |
| Mode toggle | `role="radiogroup"` with `role="radio"` items. `aria-checked` on active. |
| Save status | `aria-live="polite"` region to announce save state changes. |

### Reduced Motion

If the user has `prefers-reduced-motion: reduce`:
- Disable all animations (transitions duration to 0)
- Skeleton shimmer becomes static gray
- Drag overlay has no scale transform
- Panel slides replaced with instant appear/disappear
- Auto-layout node animation replaced with instant repositioning
- Canvas zoom transitions replaced with instant zoom

---

## 21. Keyboard Shortcuts

Implement as a P2 enhancement. All shortcuts should have a discoverable help dialog (`?` key).

### Global Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `N` | Open "New Roadmap" dialog | Dashboard |
| `I` | Open "Import JSON" dialog | Dashboard |
| `N` | Trigger "Add Module" input | Roadmap detail (no input focused) |
| `Escape` | Close panel/dialog/dropdown | Any open overlay |
| `Enter` | Submit form / save inline edit | When input is focused |
| `/` | Focus search (future) | Global |
| `?` | Open keyboard shortcuts help | Global |

### Visual Editor Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Delete` / `Backspace` | Delete selected node or edge | Editor, node/edge selected |
| `Ctrl+Z` | Undo | Editor |
| `Ctrl+Shift+Z` | Redo | Editor |
| `Ctrl+S` | Save layout | Editor |
| `Ctrl+A` | Select all nodes | Editor |
| `Escape` | Deselect all / close context menu | Editor |
| `Space` (hold) | Pan mode (hand cursor) | Editor |
| `+` / `-` | Zoom in / out | Editor |
| `Ctrl+0` | Fit view | Editor |

**Implementation notes:**
- Only active when no input/textarea is focused (except Enter, Ctrl+S, Ctrl+Z)
- Show a small "Keyboard Shortcuts" modal with a table of all shortcuts when `?` is pressed
- Shortcuts should be registered at the page level, not per-component
- Editor shortcuts are only active when the editor page is mounted

---

## 22. Dark Mode (P2)

### Strategy

- Detect system preference via `prefers-color-scheme` media query
- Allow manual override via toggle in TopBar user menu
- Store preference in Zustand (`theme: 'light' | 'dark' | 'system'`) and persist to localStorage
- Apply `dark` class to `<html>` element based on resolved theme

### Toggle Location

User menu dropdown (top-right avatar):
- "Theme" submenu or three-option toggle: Light / Dark / System
- Show current active option with a checkmark

### What Changes in Dark Mode

All components use the CSS custom properties defined in section 2.1. Switching themes swaps the property values. No per-component dark overrides needed if tokens are used consistently.

**Special attention:**
- TipTap editor background and text must respect dark tokens
- Skeleton shimmer gradient must use dark surface colors
- Shadows may need increased opacity in dark mode for visibility
- File upload zone dashed border should use the dark border color
- Google sign-in button on login page stays white (follows Google branding guidelines)
- React Flow canvas background dot pattern must use dark-appropriate colors
- Flow node backgrounds must switch to dark surface colors
- Flow edge colors must use dark border token
- Flow minimap must use dark surface background
- Editor toolbar must respect dark bg/border tokens

---

## Appendix: Component File Mapping

Quick reference mapping UI components to their expected file locations per the PRD project structure.

| Component | File Path |
|-----------|-----------|
| Button | `src/components/ui/button.tsx` |
| Input | `src/components/ui/input.tsx` |
| Dialog | `src/components/ui/dialog.tsx` |
| Dropdown | `src/components/ui/dropdown.tsx` |
| Badge | `src/components/ui/badge.tsx` |
| Progress Bar | `src/components/ui/progress-bar.tsx` |
| Skeleton | `src/components/ui/skeleton.tsx` |
| Toast | `src/components/ui/toast.tsx` |
| Date Picker | `src/components/ui/date-picker.tsx` |
| Context Menu | `src/components/ui/context-menu.tsx` |
| Sidebar | `src/components/layout/sidebar.tsx` |
| TopBar | `src/components/layout/topbar.tsx` |
| Breadcrumb | `src/components/layout/breadcrumb.tsx` |
| Roadmap Card | `src/components/roadmap/roadmap-card.tsx` |
| Roadmap Form | `src/components/roadmap/roadmap-form.tsx` |
| Roadmap Grid | `src/components/roadmap/roadmap-grid.tsx` |
| Roadmap Import | `src/components/roadmap/roadmap-import.tsx` |
| View Toggle Tabs | `src/components/roadmap/view-toggle.tsx` |
| Module Card | `src/components/module/module-card.tsx` |
| Module Form | `src/components/module/module-form.tsx` |
| Module List | `src/components/module/module-list.tsx` |
| SubModule Card | `src/components/submodule/submodule-card.tsx` |
| SubModule Form | `src/components/submodule/submodule-form.tsx` |
| SubModule Detail | `src/components/submodule/submodule-detail.tsx` |
| Status Badge | `src/components/submodule/status-badge.tsx` |
| Flow Canvas | `src/components/visual/flow-canvas.tsx` |
| Roadmap Node | `src/components/visual/roadmap-node.tsx` |
| Module Node | `src/components/visual/module-node.tsx` |
| SubModule Node | `src/components/visual/submodule-node.tsx` |
| Node Context Menu | `src/components/visual/node-context-menu.tsx` |
| Editor Toolbar | `src/components/visual/editor-toolbar.tsx` |
| Minimap Panel | `src/components/visual/minimap-panel.tsx` |
| Auto Layout Util | `src/components/visual/auto-layout.ts` |
| Checklist Item | `src/components/checklist/checklist-item.tsx` |
| Checklist List | `src/components/checklist/checklist-list.tsx` |
| Note Editor | `src/components/notes/note-editor.tsx` |
| Note List | `src/components/notes/note-list.tsx` |
| File Upload | `src/components/files/file-upload.tsx` |
| File List | `src/components/files/file-list.tsx` |
| UI Store | `src/stores/ui-store.ts` |
| Editor Store | `src/stores/editor-store.ts` |
| Roadmap Hooks | `src/hooks/use-roadmaps.ts` |
| Module Hooks | `src/hooks/use-modules.ts` |
| SubModule Hooks | `src/hooks/use-submodules.ts` |
| Checklist Hooks | `src/hooks/use-checklist.ts` |
| Notes Hooks | `src/hooks/use-notes.ts` |
| Files Hooks | `src/hooks/use-files.ts` |
| Layout Hooks | `src/hooks/use-layout.ts` |
| Import Schema Validation | `src/lib/utils/import-schema.ts` |

---

*End of Front-End Developer Guide*
