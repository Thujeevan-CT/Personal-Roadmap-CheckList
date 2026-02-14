interface ImportResult {
  valid: boolean;
  errors: string[];
  data?: ParsedRoadmap;
}

export interface ParsedRoadmap {
  title: string;
  description?: string;
  icon?: string;
  modules: ParsedModule[];
}

export interface ParsedModule {
  title: string;
  description?: string;
  submodules?: ParsedSubModule[];
}

export interface ParsedSubModule {
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
  checklist?: string[];
  notes?: string[];
}

const VALID_STATUSES = ["not_started", "in_progress", "completed", "blocked"];

export function validateImportJSON(jsonStr: string): ImportResult {
  const errors: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { valid: false, errors: [`Invalid JSON: ${(e as Error).message}`] };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { valid: false, errors: ["Root must be a JSON object"] };
  }

  const obj = parsed as Record<string, unknown>;

  if (!obj.title || typeof obj.title !== "string" || obj.title.trim().length === 0) {
    errors.push("Missing required field: title");
  } else if (obj.title.length > 200) {
    errors.push("title must be 200 characters or less");
  }

  if (obj.description && typeof obj.description !== "string") {
    errors.push("description must be a string");
  }

  if (!Array.isArray(obj.modules) || obj.modules.length === 0) {
    errors.push("Missing required field: modules (must be a non-empty array)");
  } else if (obj.modules.length > 50) {
    errors.push("Maximum 50 modules allowed");
  } else {
    (obj.modules as unknown[]).forEach((mod, mi) => {
      if (typeof mod !== "object" || mod === null) {
        errors.push(`modules[${mi}] must be an object`);
        return;
      }
      const m = mod as Record<string, unknown>;
      if (!m.title || typeof m.title !== "string") {
        errors.push(`Missing required field: modules[${mi}].title`);
      }

      if (Array.isArray(m.submodules)) {
        if (m.submodules.length > 50) {
          errors.push(`modules[${mi}] has more than 50 submodules`);
        }
        (m.submodules as unknown[]).forEach((sub, si) => {
          if (typeof sub !== "object" || sub === null) {
            errors.push(`modules[${mi}].submodules[${si}] must be an object`);
            return;
          }
          const s = sub as Record<string, unknown>;
          if (!s.title || typeof s.title !== "string") {
            errors.push(`Missing required field: modules[${mi}].submodules[${si}].title`);
          }
          if (s.status && !VALID_STATUSES.includes(s.status as string)) {
            errors.push(`modules[${mi}].submodules[${si}].status must be one of: ${VALID_STATUSES.join(", ")}`);
          }
          if (s.checklist && !Array.isArray(s.checklist)) {
            errors.push(`modules[${mi}].submodules[${si}].checklist must be an array`);
          }
          if (Array.isArray(s.checklist) && s.checklist.length > 100) {
            errors.push(`modules[${mi}].submodules[${si}] has more than 100 checklist items`);
          }
          if (s.notes && !Array.isArray(s.notes)) {
            errors.push(`modules[${mi}].submodules[${si}].notes must be an array`);
          }
        });
      }
    });
  }

  if (errors.length > 0) return { valid: false, errors };

  return { valid: true, errors: [], data: parsed as ParsedRoadmap };
}

export function getImportStats(data: ParsedRoadmap) {
  let submoduleCount = 0;
  let checklistCount = 0;
  let noteCount = 0;

  data.modules.forEach((m) => {
    if (m.submodules) {
      submoduleCount += m.submodules.length;
      m.submodules.forEach((s) => {
        checklistCount += s.checklist?.length ?? 0;
        noteCount += s.notes?.length ?? 0;
      });
    }
  });

  return {
    modules: data.modules.length,
    submodules: submoduleCount,
    checklist: checklistCount,
    notes: noteCount,
  };
}

export const AI_PROMPT_TEMPLATE = `Generate a structured roadmap in JSON format for: [YOUR GOAL HERE].
Use this exact structure:
{"title":"...","description":"...","icon":"emoji","modules":[{"title":"...","submodules":[{"title":"...","status":"not_started","checklist":["item1","item2"],"notes":["note text"]}]}]}
Rules: title is required for all items. status must be one of: not_started, in_progress, completed, blocked. checklist is an array of strings. notes is an array of strings. Keep it practical and actionable.`;
