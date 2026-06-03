/**
 * AdminDataContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for ALL dynamic data:
 *   • banners       → HeroBanner slides
 *   • categories    → CategoryBar (gender tabs + arch items)
 *   • products      → ProductCard grid + ProductDetailPage
 *   • navItems      → Navbar (already done)
 *
 * HOW TO USE
 * ──────────
 * 1. Wrap your <App /> with <AdminDataProvider>
 * 2. In any component:
 *      const { banners, categories, products } = useAdminData();
 * 3. Admin panel components use the setters:
 *      const { setBanners, setCategories, setProducts } = useAdminData();
 *
 * BACKEND INTEGRATION (later)
 * ──────────────────────────
 * Replace the useState initial values with useEffect + fetch('/api/...')
 * and call the API in each setter before updating state.
 */

import { createContext, useContext, useEffect, useState } from "react";

// ─── DEFAULT BANNERS
const DEFAULT_BANNERS = [
  {
    id: "b1",
    tag: "NEW ARRIVALS",
    title: "Summer Wedding\nLooks",
    sub: "UP TO 85% OFF",
    cta: "Shop Trends",
    ctaLink: "/category/women/ethnic-sets",
    bg: "linear-gradient(120deg,#2C1A0E 0%,#5C3A1E 55%,#8B5E2E 100%)",
    img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=480&h=320&fit=crop&crop=top",
    active: true,
    order: 0,
  },
  {
    id: "b2",
    tag: "PREMIUM EDIT",
    title: "Festive\nCollection",
    sub: "STARTING ₹599",
    cta: "Explore Now",
    ctaLink: "/category/women/sarees",
    bg: "linear-gradient(120deg,#1A1408 0%,#3D2E10 55%,#6B4F1A 100%)",
    img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=480&h=320&fit=crop&crop=top",
    active: true,
    order: 1,
  },
  {
    id: "b3",
    tag: "SUMMER SALE",
    title: "Sun-Kissed\nStyles",
    sub: "UP TO 80% OFF",
    cta: "Shop Now",
    ctaLink: "/offers",
    bg: "linear-gradient(120deg,#0D1F1A 0%,#1E4035 55%,#2D6050 100%)",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=480&h=320&fit=crop&crop=top",
    active: true,
    order: 2,
  },
  {
    id: "b4",
    tag: "KIDS STORE",
    title: "Summer\nSplash",
    sub: "Upto 70% Off",
    cta: "Shop Kids",
    ctaLink: "/category/kids/dresses-frocks",
    bg: "linear-gradient(120deg,#1A0D08 0%,#3D1E10 55%,#6B2E1A 100%)",
    img: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=480&h=320&fit=crop&crop=top",
    active: true,
    order: 3,
  },
];

// ─── DEFAULT CATEGORIES ───────────────────────────────────────
const DEFAULT_CATEGORIES = {
  WOMEN: [
    { id: "wc0",  label: "MY FEED",     isMy: true,  img: "", active: true, order: 0, link: "" },
    { id: "wc1",  label: "SAREES",      isMy: false, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=160&h=200&fit=crop&crop=top", active: true, order: 1, link: "/category/women/sarees" },
    { id: "wc2",  label: "ETHNIC SETS", isMy: false, img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=160&h=200&fit=crop&crop=top", active: true, order: 2, link: "/category/women/ethnic-sets" },
    { id: "wc3",  label: "DRESSES",     isMy: false, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=200&fit=crop&crop=top", active: true, order: 3, link: "/category/women/dresses" },
    { id: "wc4",  label: "KURTAS",      isMy: false, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=160&h=200&fit=crop&crop=top", active: true, order: 4, link: "/category/women/kurta-kurtis" },
    { id: "wc5",  label: "TOPS",        isMy: false, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=200&fit=crop&crop=top", active: true, order: 5, link: "/category/women/tops" },
    { id: "wc6",  label: "CO ORD SETS", isMy: false, img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=200&fit=crop&crop=top", active: true, order: 6, link: "/category/women/co-ord-set" },
    { id: "wc7",  label: "BOTTOMS",     isMy: false, img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=160&h=200&fit=crop&crop=top", active: true, order: 7, link: "/category/women/trousers" },
    { id: "wc8",  label: "FOOTWEAR",    isMy: false, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=200&fit=crop", active: true, order: 8, link: "/category/women/flats" },
    { id: "wc9",  label: "ACCESSORIES", isMy: false, img: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=160&h=200&fit=crop", active: true, order: 9, link: "/category/women/imitation-jewellery" },
    { id: "wc10", label: "BAGS",        isMy: false, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=160&h=200&fit=crop", active: true, order: 10, link: "" },
    { id: "wc11", label: "BEAUTY",      isMy: false, img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&h=200&fit=crop", active: true, order: 11, link: "" },
  ],
  MEN: [
    { id: "mc0", label: "MY FEED",    isMy: true,  img: "", active: true, order: 0, link: "" },
    { id: "mc1", label: "JEANS",      isMy: false, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=160&h=200&fit=crop&crop=top", active: true, order: 1, link: "/category/men/jeans" },
    { id: "mc2", label: "T-SHIRT",    isMy: false, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=200&fit=crop&crop=top", active: true, order: 2, link: "/category/men/t-shirts" },
    { id: "mc3", label: "SHIRTS",     isMy: false, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=200&fit=crop&crop=top", active: true, order: 3, link: "/category/men/casual-shirts" },
    { id: "mc4", label: "ETHNIC",     isMy: false, img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=160&h=200&fit=crop&crop=top", active: true, order: 4, link: "/category/men/kurtas" },
    { id: "mc5", label: "FOOTWEAR",   isMy: false, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=200&fit=crop", active: true, order: 5, link: "/category/men/casual-shoes" },
  ],
  GIRLS: [
    { id: "gc0", label: "MY FEED",    isMy: true,  img: "", active: true, order: 0, link: "" },
    { id: "gc1", label: "DRESSES",    isMy: false, img: "https://images.unsplash.com/photo-1618245318763-a15156d6b23c?w=160&h=200&fit=crop&crop=top", active: true, order: 1, link: "" },
    { id: "gc2", label: "TOPS",       isMy: false, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=200&fit=crop&crop=top", active: true, order: 2, link: "" },
    { id: "gc3", label: "ETHNIC",     isMy: false, img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=160&h=200&fit=crop&crop=top", active: true, order: 3, link: "" },
  ],
  BOYS: [
    { id: "bc0", label: "MY FEED",    isMy: true,  img: "", active: true, order: 0, link: "" },
    { id: "bc1", label: "T-SHIRTS",   isMy: false, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=200&fit=crop&crop=top", active: true, order: 1, link: "" },
    { id: "bc2", label: "SHIRTS",     isMy: false, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=200&fit=crop&crop=top", active: true, order: 2, link: "" },
    { id: "bc3", label: "JEANS",      isMy: false, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=160&h=200&fit=crop&crop=top", active: true, order: 3, link: "" },
  ],
};

// ─── DEFAULT PRODUCTS ─────────────────────────────────────────
// Each product has:
//   colorVariants: [{ colorName, hex, images: [url, url, ...] }]
//   The first image of the first variant = homepage thumbnail
 const DEFAULT_PRODUCTS = [
  {
    id: 1,
    title: "Printed Anarkali Kurta",
    brand: "Divya Agrawal",
    price: 899,
    mrp: 2499,
    fabric: "Cotton Blend",
    pattern: "Printed",
    occasion: "Casual / Festive",
    fit: "Regular Fit",
    washCare: "Machine Wash Cold",
    description: "A beautifully crafted Anarkali Kurta Set featuring vibrant prints inspired by Indian heritage. Perfect for casual outings and festive occasions.",
    highlights: ["Premium 100% Cotton Blend fabric", "Vibrant ethnic print design", "Includes kurta + palazzo + dupatta", "Comfortable for all-day wear", "Easy machine washable"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.3,
    reviews: 128,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv1",
        colorName: "Red",
        hex: "#E53935",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=600&h=800&fit=crop&crop=top",
        ],
      },
      {
        id: "cv2",
        colorName: "Blue",
        hex: "#1E88E5",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [
      { name: "Priya R.", rating: 5, date: "12 May 2025", text: "Absolutely love this kurta! Very soft fabric.", verified: true },
      { name: "Meera S.", rating: 4, date: "3 Apr 2025", text: "Color is exactly as shown. Comfortable.", verified: true },
    ],
  },
  {
    id: 2,
    title: "Embroidered Straight Kurta",
    brand: "Meera S.",
    price: 1199,
    mrp: 3499,
    fabric: "Silk",
    pattern: "Embroidered",
    occasion: "Festive",
    fit: "Straight Fit",
    washCare: "Dry Clean Only",
    description: "Elegant embroidered straight kurta with intricate threadwork. Perfect for festive occasions.",
    highlights: ["Pure Silk fabric", "Hand embroidered design", "Festive ready", "Comes with dupatta"],
    sizes: ["M", "L", "XL", "XXL"],
    rating: 4.5,
    reviews: 243,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv3",
        colorName: "Green",
        hex: "#43A047",
        images: [
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&crop=top",
        ],
      },
      {
        id: "cv4",
        colorName: "Yellow",
        hex: "#FDD835",
        images: [
          "https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [
      { name: "Kavya M.", rating: 4, date: "18 Mar 2025", text: "Good product for the price.", verified: false },
    ],
  },
  {
    id: 3,
    title: "Silk Blend Saree",
    brand: "Pooja V.",
    price: 1599,
    mrp: 4299,
    fabric: "Silk",
    pattern: "Woven",
    occasion: "Wedding",
    fit: "Free Size",
    washCare: "Dry Clean",
    description: "Luxurious silk blend saree with traditional woven patterns. A timeless piece for weddings.",
    highlights: ["Premium Silk Blend", "Traditional woven border", "With unstitched blouse piece"],
    sizes: ["Free Size"],
    rating: 4.7,
    reviews: 312,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv5",
        colorName: "Purple",
        hex: "#8E24AA",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [],
  },
  {
    id: 4,
    title: "Co-Ord Ethnic Set",
    brand: "Ankita M.",
    price: 1099,
    mrp: 2799,
    fabric: "Georgette",
    pattern: "Printed",
    occasion: "Party",
    fit: "Regular",
    washCare: "Hand Wash",
    description: "Trendy ethnic co-ord set perfect for parties and festive occasions.",
    highlights: ["Georgette fabric", "Matching top + bottom", "Festive print"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.2,
    reviews: 176,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv6",
        colorName: "Orange",
        hex: "#FB8C00",
        images: [
          "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [],
  },
  {
    id: 5,
    title: "Palazzo Kurta Set",
    brand: "Rekha K.",
    price: 799,
    mrp: 1999,
    fabric: "Rayon",
    pattern: "Solid",
    occasion: "Casual",
    fit: "Flared",
    washCare: "Machine Wash",
    description: "Comfortable palazzo kurta set in premium rayon fabric. Daily wear staple.",
    highlights: ["Premium Rayon", "Palazzo + Kurta set", "Solid color", "Breathable fabric"],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.4,
    reviews: 201,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv7",
        colorName: "Pink",
        hex: "#E91E8C",
        images: [
          "https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=600&h=800&fit=crop&crop=top",
        ],
      },
      {
        id: "cv8",
        colorName: "White",
        hex: "#F5F5F5",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [],
  },
  {
    id: 6,
    title: "Chikankari Kurta",
    brand: "Sunita R.",
    price: 1349,
    mrp: 3299,
    fabric: "Cotton",
    pattern: "Chikankari",
    occasion: "Festive",
    fit: "Regular",
    washCare: "Hand Wash",
    description: "Authentic Lucknowi Chikankari kurta with delicate handwork. A wardrobe essential.",
    highlights: ["Authentic Chikankari", "Hand embroidered", "Premium Cotton", "Festive & Casual"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.6,
    reviews: 421,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv9",
        colorName: "White",
        hex: "#F5F5F5",
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=600&h=800&fit=crop&crop=top",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [],
  },
  {
    id: 7,
    title: "Mirror Work Kurti",
    brand: "Priya D.",
    price: 949,
    mrp: 2199,
    fabric: "Cotton",
    pattern: "Embroidered",
    occasion: "Festive",
    fit: "Regular",
    washCare: "Hand Wash",
    description: "Vibrant mirror work kurti with intricate embroidery. Stand out at every festive gathering.",
    highlights: ["Mirror embroidery", "Cotton fabric", "Festive occasion", "Vibrant colors"],
    sizes: ["M", "L", "XL"],
    rating: 4.0,
    reviews: 67,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv10",
        colorName: "Blue",
        hex: "#1E88E5",
        images: [
          "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [],
  },
  {
    id: 8,
    title: "Georgette Tunic Top",
    brand: "Tanya M.",
    price: 699,
    mrp: 1799,
    fabric: "Georgette",
    pattern: "Solid",
    occasion: "Office",
    fit: "Loose",
    washCare: "Machine Wash",
    description: "Flowy georgette tunic top perfect for office wear and casual outings.",
    highlights: ["Georgette fabric", "Office ready", "Solid color", "Easy care"],
    sizes: ["XS", "S", "M", "L"],
    rating: 4.3,
    reviews: 155,
    inStock: true,
    active: true,
    showOnHome: true,
    colorVariants: [
      {
        id: "cv11",
        colorName: "Black",
        hex: "#212121",
        images: [
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop&crop=top",
        ],
      },
      {
        id: "cv12",
        colorName: "White",
        hex: "#F5F5F5",
        images: [
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop&crop=top",
        ],
      },
    ],
    reviews_list: [],
  },
];

// ─── CONTEXT ──────────────────────────────────────────────────
const AdminDataContext = createContext(null);

let _nextId = 1000;
 const genId = () => `id_${_nextId++}`;

export function AdminDataProvider({ children }) {
  // start with defaults (fast render), then replace with DB data
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        // Dynamic import avoids circular deps / keeps file smaller
        const HomepageApi = await import("../../Api/HomepageApi.js");
        const [b, c, p] = await Promise.all([
          HomepageApi.fetchAllBanners(),
          HomepageApi.fetchAllCategoriesGrouped(),
          HomepageApi.fetchAllProducts(),
        ]);

        if (cancelled) return;
        setBanners(Array.isArray(b) ? b : []);
        setCategories(c && typeof c === "object" ? c : {});
        setProducts(Array.isArray(p) ? p : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Failed to load admin data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshAll() {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    const [b, c, p] = await Promise.all([
      HomepageApi.fetchAllBanners(),
      HomepageApi.fetchAllCategoriesGrouped(),
      HomepageApi.fetchAllProducts(),
    ]);
    setBanners(Array.isArray(b) ? b : []);
    setCategories(c && typeof c === "object" ? c : {});
    setProducts(Array.isArray(p) ? p : []);
  }

  // ── Banner helpers (backend connected) ─────────────────────
  const addBanner = async (payload) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    await HomepageApi.addBanner(payload);
    await refreshAll();
  };

  const updateBanner = async (payload) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    const id = payload?.id;
    if (!id) return;
    await HomepageApi.updateBanner(id, payload);
    await refreshAll();
  };

  const deleteBanner = async (id) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    await HomepageApi.deleteBanner(id);
    await refreshAll();
  };

  // reorder banners: update order field + refresh
  const reorderBanners = async (arr) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    const updates = (arr || []).map((b, i) => HomepageApi.updateBanner(b.id, { ...b, order: i }));
    await Promise.all(updates);
    await refreshAll();
  };

  // ── Category helpers (backend connected) ────────────────
  const addCategory = async (gender, cat) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    await HomepageApi.addCategory(gender, cat);
    await refreshAll();
  };

  const updateCategory = async (gender, cat) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    // HomepageApi.updateCategory expects (gender, item) but internally uses item.id/_id
    await HomepageApi.updateCategory(gender, cat);
    await refreshAll();
  };


  const deleteCategory = async (gender, id) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    await HomepageApi.deleteCategory(gender, id);
    await refreshAll();
  };

  // ── Product helpers (backend connected) ────────────────────
  const addProduct = async (payload) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    await HomepageApi.addProduct(payload);
    await refreshAll();
  };

  const updateProduct = async (payload) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    const id = payload?.id;
    if (!id) return;
    await HomepageApi.updateProduct(id, payload);
    await refreshAll();
  };

  const deleteProduct = async (id) => {
    const HomepageApi = await import("../../Api/HomepageApi.js");
    await HomepageApi.deleteProduct(id);
    await refreshAll();
  };

  return (
    <AdminDataContext.Provider
      value={{
        banners,
        setBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        reorderBanners,
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        loading,
        error,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}


export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be inside AdminDataProvider");
  return ctx;
}