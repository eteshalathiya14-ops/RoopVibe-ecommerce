/**
 * Converts a label (e.g., "Kurta Kurtis") to a URL-friendly slug (e.g., "kurta-kurtis")
 */
export const toSlug = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};

/**
 * Converts a slug back to a readable label (best effort)
 */
export const fromSlug = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
