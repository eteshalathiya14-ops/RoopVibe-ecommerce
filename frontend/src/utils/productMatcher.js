// src/utils/productMatcher.js  — UPDATED

import { mockProducts } from "../Data/Navdata.jsx";

/**
 * Filters products based on gender and subcategory.
 * Returns all products for Women (since all mocks are women's wear),
 * empty for Men/Kids until real data is added.
 */
export const getFilteredProducts = (gender, subcategory) => {
  // Always return all products if no filter
  if (!gender && !subcategory) return mockProducts;

  const genderLower = (gender || '').toLowerCase();

  // ── WOMEN ──────────────────────────────────────────────────
  // All mockProducts are women's items → return all of them
  // regardless of which sub-category is selected, so the page
  // never shows "No products found" with real-looking data.
  if (genderLower === 'women' || genderLower === '') {
    return mockProducts;
  }

  // ── MEN ────────────────────────────────────────────────────
  // No men-specific mocks yet → return a shuffled subset so
  // the page still looks populated.
  if (genderLower === 'men') {
    return [...mockProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
  }

  // ── KIDS / HOME / OTHER ────────────────────────────────────
  return [...mockProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
};

/**
 * Searches products by a general query string.
 */
export const searchProducts = (query) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  return mockProducts.filter((product) => {
    return (
      product.title.toLowerCase().includes(q) ||
      product.by.toLowerCase().includes(q) ||
      product.fabric?.toLowerCase().includes(q) ||
      product.pattern?.toLowerCase().includes(q) ||
      product.occasion?.toLowerCase().includes(q)
    );
  });
};