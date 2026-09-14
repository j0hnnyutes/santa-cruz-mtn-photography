// Shared between the admin upload/edit routes (validation) and the admin
// gallery UI (dropdown options) so there's exactly one place that defines
// what a photo's section can be. Order here is also the order the public
// gallery's stacked sections (Concept C) render in.
export const PHOTO_CATEGORIES = ["Landscape", "Events", "Aerial"] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

const CATEGORY_SET = new Set<string>(PHOTO_CATEGORIES);

export function isPhotoCategory(value: unknown): value is PhotoCategory {
  return typeof value === "string" && CATEGORY_SET.has(value);
}
