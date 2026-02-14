import mongoose, { type Document } from "mongoose";

export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function isObjectId(v: unknown): v is mongoose.Types.ObjectId {
  return v instanceof mongoose.Types.ObjectId;
}

export function serializeDoc<T extends Document | Record<string, unknown>>(doc: T): Record<string, unknown> {
  const obj =
    doc && typeof (doc as Document).toObject === "function"
      ? (doc as Document).toObject()
      : (doc as Record<string, unknown>);
  return serializeObj(obj);
}

export function serializeObj(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isObjectId(v)) {
      out[k] = v.toString();
    } else if (v instanceof Date) {
      out[k] = v.toISOString();
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) =>
        item && typeof item === "object" && !(item instanceof Date) && !isObjectId(item)
          ? serializeObj(item as Record<string, unknown>)
          : isObjectId(item)
          ? item.toString()
          : item instanceof Date
          ? item.toISOString()
          : item
      );
    } else if (v && typeof v === "object" && v.constructor === Object) {
      out[k] = serializeObj(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function serializeMany<T extends Document>(docs: T[]) {
  return docs.map((d) => serializeDoc(d));
}
