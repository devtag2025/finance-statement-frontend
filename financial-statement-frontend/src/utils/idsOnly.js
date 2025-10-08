// utils/idsOnly.js
const isIdLike = (v) =>
  v && typeof v === "object" && (("_id" in v) || ("id" in v) || ("value" in v));

const keepAsIs = (v) =>
  v instanceof File || v instanceof Blob || v instanceof Date || v === null;

export function idsOnly(value) {
  if (keepAsIs(value) || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (keepAsIs(item)) return item;
      if (isIdLike(item)) return String(item._id ?? item.id ?? item.value);
      return idsOnly(item);
    });
  }

  // plain object
  if (isIdLike(value)) {
    // ✅ Only collapse if it's *just* an id wrapper
    const keys = Object.keys(value);
    const idKeys = ["_id", "id", "value"];
    const isJustIdWrapper = keys.every((k) => idKeys.includes(k));
    if (isJustIdWrapper) {
      return String(value._id ?? value.id ?? value.value);
    }
    // else: don't collapse whole object; recurse into fields below
  }

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (keepAsIs(v) || typeof v !== "object") {
      out[k] = v;
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) =>
        isIdLike(item)
          ? String(item._id ?? item.id ?? item.value)
          : idsOnly(item)
      );
    } else if (isIdLike(v)) {
      const keys = Object.keys(v);
      const idKeys = ["_id", "id", "value"];
      const isJustIdWrapper = keys.every((kk) => idKeys.includes(kk));
      out[k] = isJustIdWrapper
        ? String(v._id ?? v.id ?? v.value)
        : idsOnly(v);
    } else {
      out[k] = idsOnly(v);
    }
  }
  return out;
}
