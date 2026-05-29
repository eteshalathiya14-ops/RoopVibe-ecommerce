export const WISHLIST_STORAGE_KEY = 'roopvibe_wishlist';

export function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

