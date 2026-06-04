// src/utils/categoryIndex.js
// ─────────────────────────────────────────────────────────────
// Converts URL params (gender + subcategory slug) to
// { gender (navName), colTitle, subcategory (subItem) }
// Used by CategoryPage to know what to fetch from DB
// ─────────────────────────────────────────────────────────────

// Convert slug back to possible title variants
function slugToTitle(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Slug a string for comparison
function toSlug(str) {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Full navbar structure — matches ProductAdmin.jsx and CategoryBarAdmin.jsx
// This maps slugs → actual colTitle/subItem strings stored in DB
const NAVBAR_STRUCTURE = [
  {
    name: "WOMEN",
    columns: [
      {
        title: "Ethnic Wear",
        items: ["Kurta Kurtis","Sarees","Ethnic Sets","Ethnic Co Ord Sets","Lehengas And Blouse",
                "Ethnic Dresses","Skirts","Leggings, Salwar & Churidaar","Shawls & Dupattas",
                "Tapered Pants","Woolen Kurta","Unstitched & Semi Stitched Suits"],
      },
      {
        title: "Western Wear",
        items: ["Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers",
                "Co Ord Set","Shirts","Jumpsuits","Shorts","Kaftans","Shrugs",
                "Cargos","Joggers","Shackets","Sweaters & Sweatshirts","Jackets, Blazers & Coats"],
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
    // Unknown gender — still return it so DB query can try
    return { gender: genderUpper, colTitle: "", subcategory: slugToTitle(subcategory) };
  }

  if (!subcategory) {
    // No subcategory — whole section
    return { gender: genderUpper, colTitle: "", subcategory: "" };
  }

  const subSlug = subcategory.toLowerCase();

  // Step 1: Try to match subcategory as a colTitle (e.g. "ethnic-wear" → "Ethnic Wear")
  for (const col of navItem.columns) {
    if (toSlug(col.title) === subSlug) {
      return { gender: genderUpper, colTitle: col.title, subcategory: "" };
    }
  }

  // Step 2: Try to match as a subItem within a column
  for (const col of navItem.columns) {
    for (const item of col.items) {
      if (toSlug(item) === subSlug) {
        return { gender: genderUpper, colTitle: col.title, subcategory: item };
      }
    }
  }

  // Step 3: Fuzzy match — try partial slug match for subItem
  for (const col of navItem.columns) {
    for (const item of col.items) {
      const itemSlug = toSlug(item);
      if (itemSlug.includes(subSlug) || subSlug.includes(itemSlug.split("-")[0])) {
        return { gender: genderUpper, colTitle: col.title, subcategory: item };
      }
    }
  }

  // Step 4: Fuzzy match for colTitle
  for (const col of navItem.columns) {
    const colSlug = toSlug(col.title);
    if (colSlug.includes(subSlug) || subSlug.includes(colSlug.split("-")[0])) {
      return { gender: genderUpper, colTitle: col.title, subcategory: "" };
    }
  }

  // Not found — return as-is, let DB try
  return {
    gender: genderUpper,
    colTitle: "",
    subcategory: slugToTitle(subcategory),
  };
}

// Export toSlug for use in other files
export { toSlug };