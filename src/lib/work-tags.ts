// Portfolio tags. The four built-in tags are fixed; the client can add more in the admin (kept in site settings).
export const BASE_WORK_TAGS = ["MV", "FEATURE_FILMS", "TV_COMMERCIAL", "OTHERS"] as const;

const BASE_LABELS: Record<string, string> = {
  MV: "Music Videos",
  FEATURE_FILMS: "Feature Films",
  TV_COMMERCIAL: "TV Commercials",
  OTHERS: "Others",
  // older data used these
  FEATURE: "Feature Films",
  COMMERCIAL: "TV Commercials",
};

/** "Documentary" or "behind the scenes" -> "DOCUMENTARY" / "BEHIND_THE_SCENES", the same style as the built-in tags. */
export function normalizeTag(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
}

/** Readable name for a tag, used on the admin chips and the Our Work filter buttons. */
export function tagLabel(tag: string): string {
  if (BASE_LABELS[tag]) return BASE_LABELS[tag];
  return tag
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}
