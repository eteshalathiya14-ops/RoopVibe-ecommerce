// src/utils/categoryIndex.js
// ─────────────────────────────────────────────────────────────
// Converts URL params (gender + subcategory slug) ↔
// { gender (navName), colTitle, subcategory (subItem) }
//
// Also exports:
//   toSlug(str)           → URL-safe slug
//   getCategoryPath(...)  → build a /category/... URL from navName + colTitle + subItem
// ─────────────────────────────────────────────────────────────

// Convert a display string to a URL slug
export function toSlug(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Convert slug back to possible title variants
function slugToTitle(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Full navbar structure — must match ProductAdmin.jsx
const NAVBAR_STRUCTURE = [
  {
    name: "WOMEN",
    columns: [
      {
        title: "Ethnic Wear",
        items: [
          "Kurta Kurtis","Sarees","Ethnic Sets","Ethnic Co Ord Sets",
          "Lehengas And Blouse","Ethnic Dresses","Skirts",
          "Leggings, Salwar & Churidaar","Shawls & Dupattas",
          "Tapered Pants","Woolen Kurta","Unstitched & Semi Stitched Suits",
        ],
      },
      {
        title: "Western Wear",
        items: [
          "Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers",
          "Co Ord Set","Shirts","Jumpsuits","Shorts","Kaftans","Shrugs",
          "Cargos","Joggers","Shackets","Sweaters & Sweatshirts",
          "Jackets, Blazers & Coats",
        ],
      },
      {
        title: "Sports & Activewear",
        items: ["Swim Wear","Tights","Track Pants","Sports Bra"],
      },
      {
        title: "Lingerie & Sleepwear",
        items: ["Bra","Panties","Lingerie Sets","Sleepwear & Loungewear","Shape Wear","Camisoles & Thermals"],
      },
      {
        title: "Jewellery",
        items: ["Imitation Jewellery","Earrings","Necklace & Pendants","Rings, Bangles & Bracelets"],
      },
      {
        title: "Footwear",
        items: ["Flats","Heels","Casual Shoes","Flip Flops","Sport Shoes & Sneakers","Boots"],
      },
    ],
  },
  {
    name: "MEN",
    columns: [
      {
        title: "Top Wear",
        items: ["Casual Shirts","Co Ord Set","Formal Shirts","Polo T Shirts",
          "Suits & Blazers","T-Shirts","Oversized T Shirts"],
      },
      {
        title: "Bottom Wear",
        items: ["Cargos","Casual Trousers","Formal Trousers","Jeans","Joggers","Shorts & Three Fourth"],
      },
      {
        title: "Ethnic Wear",
        items: ["Ethnic Wear Sets","Ethnic Bottom Wear","Kurtas","Nehru Jackets","Waist Coat"],
      },
      {
        title: "Footwear",
        items: ["Casual Shoes","Formal Shoes","Jutis And Mojaris","Sports Shoes","Slippers & Sandals"],
      },
      {
        title: "Accessories",
        items: ["Caps And Hats","Cufflinks & Bracelets","Lapel Pins & Brooch","Handkerchiefs","Socks","Ties & Pocket Squares"],
      },
    ],
  },
  {
    name: "KIDS",
    columns: [
      {
        title: "Boys",
        items: ["T-Shirts","Shirts","Bottom Wear","Ethnic Wear","Sweater & Sweatshirt",
          "Coats & Jackets","Innerwear & Nightwear","Twin Sets & Dungrees","Suit Sets",
          "0-2 Years","2-6 Years","6-12 Years","12-16 Years"],
      },
      {
        title: "Girls",
        items: ["Dresses & Frocks","Tees & Tops","Bottom Wear","Ethnic Wear",
          "Sweater, Sweatshirts & Cardigans","Coats & Jackets","Twin Sets & Jump Suits",
          "Innerwear & Nightwear","Leggings","Party Gowns",
          "0-2 Years","2-6 Years","6-12 Years","12-16 Years"],
      },
      {
        title: "Footwear",
        items: ["Sandals & Floaters","Casual Shoes","Sports Shoes","Formal Shoes"],
      },
    ],
  },
  {
    name: "HOME",
    columns: [
      { title: "Bedding", items: ["Bed Sheets","Pillow Covers","Blankets","Comforters","Quilts"] },
      { title: "Decor",   items: ["Wall Art","Cushions","Candles","Photo Frames","Showpieces"] },
      { title: "Kitchen", items: ["Cookware","Storage","Serveware","Cleaning"] },
      { title: "Bath",    items: ["Towels","Bath Mats","Shower Curtains"] },
    ],
  },
];

/**
 * Build a /category/ URL from navName + colTitle + subItem
 *
 * Examples:
 *   getCategoryPath("WOMEN")                          → /category/women
 *   getCategoryPath("WOMEN","Ethnic Wear")             → /category/women/ethnic-wear
 *   getCategoryPath("WOMEN","Ethnic Wear","Sarees")    → /category/women/sarees
 */
export function getCategoryPath(navName, colTitle = "", subItem = "") {
  const gender = (navName || "").toLowerCase();
  if (!gender) return "/";

  if (subItem) {
    return `/category/${gender}/${toSlug(subItem)}`;
  }
  if (colTitle) {
    return `/category/${gender}/${toSlug(colTitle)}`;
  }
  return `/category/${gender}`;
}

/**
 * Resolves URL params to { gender, colTitle, subcategory }
 *
 * URL: /category/women/sarees
 * → { gender: "WOMEN", colTitle: "Ethnic Wear", subcategory: "Sarees" }
 *
 * URL: /category/men/jeans
 * → { gender: "MEN", colTitle: "Bottom Wear", subcategory: "Jeans" }
 *
 * URL: /category/women/ethnic-wear
 * → { gender: "WOMEN", colTitle: "Ethnic Wear", subcategory: "" }
 */
export function getCategoryByParams(gender, subcategory) {
  if (!gender) return null;

  const genderUpper = gender.toUpperCase();
  const navItem = NAVBAR_STRUCTURE.find(n => n.name === genderUpper);

  if (!navItem) {
    return { gender: genderUpper, colTitle: "", subcategory: slugToTitle(subcategory) };
  }

  if (!subcategory) {
    return { gender: genderUpper, colTitle: "", subcategory: "" };
  }

  const subSlug = subcategory.toLowerCase();

  // Try colTitle match first (e.g. "ethnic-wear" → "Ethnic Wear")
  for (const col of navItem.columns) {
    if (toSlug(col.title) === subSlug) {
      return { gender: genderUpper, colTitle: col.title, subcategory: "" };
    }
  }

  // Try subItem match within columns
  for (const col of navItem.columns) {
    for (const item of col.items) {
      if (toSlug(item) === subSlug) {
        return { gender: genderUpper, colTitle: col.title, subcategory: item };
      }
    }
  }

  // Fuzzy match for subItem
  for (const col of navItem.columns) {
    for (const item of col.items) {
      const itemSlug = toSlug(item);
      if (itemSlug.includes(subSlug) || subSlug.includes(itemSlug.split("-")[0])) {
        return { gender: genderUpper, colTitle: col.title, subcategory: item };
      }
    }
  }

  // Fuzzy match for colTitle
  for (const col of navItem.columns) {
    const colSlug = toSlug(col.title);
    if (colSlug.includes(subSlug) || subSlug.includes(colSlug.split("-")[0])) {
      return { gender: genderUpper, colTitle: col.title, subcategory: "" };
    }
  }

  return {
    gender: genderUpper,
    colTitle: "",
    subcategory: slugToTitle(subcategory),
  };
}