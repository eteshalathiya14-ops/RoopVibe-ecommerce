// ─────────────────────────────────────────────────────────────
//  src/data/navData.js
//  Shared data for Navbar mega-menu + CategoryPage
// ─────────────────────────────────────────────────────────────

export const navLinks = [
  {
    name: "WOMEN",
    mega: {
      columns: [
        {
          title: "Ethnic Wear",
          items: [
            "Kurta Kurtis", "Sarees", "Ethnic Sets", "Ethnic Co Ord Sets",
            "Lehengas And Blouse", "Ethnic Dresses", "Skirts",
            "Leggings, Salwar & Churidaar", "Shawls & Dupattas",
            "Tapered Pants", "Woolen Kurta", "Unstitched & Semi Stitched Suits",
          ],
        },
        {
          title: "Western Wear",
          items: [
            "Dresses", "Tops", "Tunics", "T-Shirts", "Jeans & Jeggings",
            "Trousers", "Co Ord Set", "Shirts", "Jumpsuits", "Shorts",
            "Kaftans", "Shrugs", "Cargos", "Joggers", "Shackets",
            "Sweaters & Sweatshirts", "Jackets, Blazers & Coats",
          ],
        },
        {
          title: "Sports & Activewear",
          items: ["Swim Wear", "Tights", "Track Pants", "Sports Bra"],
          extra: [
            {
              title: "Lingerie & Sleepwear",
              items: ["Bra", "Panties", "Lingerie Sets", "Sleepwear & Loungewear", "Shape Wear", "Camisoles & Thermals"],
            },
            {
              title: "Western Wear Plus Size",
              items: ["Dresses", "Tops", "Co Ords"],
            },
          ],
        },
        {
          title: "Jewellery",
          items: ["Imitation Jewellery", "Earrings", "Necklace & Pendants", "Rings, Bangles & Bracelets"],
          extra: [
            {
              title: "Footwear",
              items: ["Flats", "Heels", "Casual Shoes", "Flip Flops", "Sport Shoes & Sneakers", "Boots"],
            },
            {
              title: "Electronics",
              items: ["Smart Watches", "Bluetooth Speaker", "Earbuds", "Bluetooth Neckband"],
            },
          ],
        },
        {
          title: "Brands",
          items: [
            "3Buddy Fashion", "Anubhutte", "Aurelia", "Azira", "Baggit",
            "Clovia", "Cottinfab", "Drape And Dazzle", "Globus", "Hive91",
            "IUGA", "MELON - By PlusS", "Mojilaa", "Moomaya", "Oxolloxo",
            "Readiprint", "SOCH",
          ],
        },
      ],
    },
  },
  {
    name: "MEN",
    mega: {
      columns: [
        {
          title: "Top Wear",
          items: ["Casual Shirts", "Co Ord Set", "Formal Shirts", "Polo T Shirts", "Suits & Blazers", "T-Shirts", "Oversized T Shirts"],
          extra: [
            { title: "Bottom Wear", items: ["Cargos", "Casual Trousers", "Formal Trousers", "Jeans", "Joggers", "Shorts & Three Fourth"] },
          ],
        },
        {
          title: "Ethnic Wear",
          items: ["Ethnic Wear Sets", "Ethnic Bottom Wear", "Kurtas", "Nehru Jackets", "Waist Coat"],
          extra: [
            { title: "Sports Wear", items: ["Shorts", "T-Shirts", "Track Pants", "Track Suits"] },
            { title: "Plus Size", items: ["Bottom Wear", "Inner Wear", "Top Wear"] },
          ],
        },
        {
          title: "Footwear",
          items: ["Casual Shoes", "Formal Shoes", "Jutis And Mojaris", "Sports Shoes", "Slippers & Sandals"],
          extra: [
            { title: "Winter Wear", items: ["Gloves", "Jackets", "Shackets", "Shawls & Mufflers", "Sweaters", "Sweatshirts", "Thermals"] },
          ],
        },
        {
          title: "Accessories",
          items: ["Caps And Hats", "Cufflinks & Bracelets", "Lapel Pins & Brooch", "Handkerchiefs", "Socks", "Ties & Pocket Squares"],
          extra: [
            { title: "Innerwear", items: ["Boxers", "Briefs", "Vests"] },
            { title: "Electronics", items: ["Smart Watches", "Bluetooth Speaker", "Earbuds", "Bluetooth Neckband"] },
          ],
        },
        {
          title: "Brands",
          items: ["Linaria", "Xee", "Ketch", "RIGO", "SHOWOFF", "Duke", "FTX", "Dollar", "Classic Polo", "Jompers", "CHKOKKO"],
        },
      ],
    },
  },
  {
    name: "KIDS",
    mega: {
      columns: [
        {
          title: "Boys",
          items: ["T-Shirts", "Shirts", "Bottom Wear", "Ethnic Wear", "Sweater & Sweatshirt", "Coats & Jackets", "Innerwear & Nightwear", "Twin Sets & Dungrees", "Suit Sets"],
          extra: [
            { title: "Shop By Age", badge: "Boys", items: ["0-2 Years", "2-6 Years", "6-12 Years", "12-16 Years"] },
          ],
        },
        {
          title: "Girls",
          items: ["Dresses & Frocks", "Tees & Tops", "Bottom Wear", "Ethnic Wear", "Sweater, Sweatshirts & Cardigans", "Coats & Jackets", "Twin Sets & Jump Suits", "Innerwear & Nightwear", "Leggings", "Party Gowns"],
          extra: [
            { title: "Shop By Age", badge: "Girls", items: ["0-2 Years", "2-6 Years", "6-12 Years", "12-16 Years"] },
          ],
        },
        {
          title: "Footwear",
          items: ["Sandals & Floaters", "Casual Shoes", "Sports Shoes", "Formal Shoes"],
          extra: [
            { title: "Accessories", items: ["Socks", "Cap", "Sunglasses", "Bag"] },
            { title: "Bed & Bath", items: ["Bedsheet", "Mat", "Blanket", "Curtain"] },
          ],
        },
        {
          title: "Brands",
          items: ["Eavan", "Under Fourteen Only", "BEING NAUGHTY", "Fashion Dream", "MoMaa", "Polka Tots", "U.S. Polo Assn. Kids", "TALES & STORIES", "NeuVin"],
        },
      ],
    },
  },
  {
    name: "HOME",
    mega: {
      columns: [
        { title: "Bedding", items: ["Bed Sheets", "Pillow Covers", "Blankets", "Comforters", "Quilts"] },
        { title: "Decor", items: ["Wall Art", "Cushions", "Candles", "Photo Frames", "Showpieces"] },
        { title: "Kitchen", items: ["Cookware", "Storage", "Serveware", "Cleaning"] },
        { title: "Bath", items: ["Towels", "Bath Mats", "Shower Curtains"] },
      ],
    },
  },
  { name: "OFFERS", special: true },
];

// ─── Mock Products (used in CategoryPage) ──────────────────────
const baseProducts = [
  { id: 1,  title: "Printed Anarkali Kurta",      price: 899,  mrp: 2499, disc: 64, by: "Divya Agrawal", img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=400&fit=crop", rating: 4.3, reviews: 128, colors: ["Red","Blue"], sizes: ["S","M","L","XL"], fabric: "Cotton",   pattern: "Printed",     occasion: "Casual" },
  { id: 2,  title: "Embroidered Straight Kurta",  price: 1199, mrp: 3499, disc: 66, by: "Meera S.",      img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=400&fit=crop", rating: 4.5, reviews: 243, colors: ["Green","Yellow"], sizes: ["M","L","XL","XXL"], fabric: "Silk", pattern: "Embroidered", occasion: "Festive" },
  { id: 3,  title: "Cotton Block Print Kurti",    price: 649,  mrp: 1599, disc: 59, by: "Pooja V.",      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=400&fit=crop", rating: 4.1, reviews: 89,  colors: ["Blue","White"], sizes: ["XS","S","M"], fabric: "Cotton", pattern: "Block Print",  occasion: "Daily Wear" },
  { id: 4,  title: "Flared A-Line Kurta",         price: 799,  mrp: 1999, disc: 60, by: "Rekha K.",      img: "https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=300&h=400&fit=crop", rating: 4.4, reviews: 312, colors: ["Pink","Purple"], sizes: ["S","M","L"], fabric: "Rayon", pattern: "Solid", occasion: "Casual" },
  { id: 5,  title: "Designer Palazzo Set",        price: 1099, mrp: 2799, disc: 61, by: "Ankita M.",     img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=400&fit=crop", rating: 4.2, reviews: 176, colors: ["Orange","Red"], sizes: ["M","L","XL"], fabric: "Georgette", pattern: "Printed", occasion: "Party" },
  { id: 6,  title: "Chikankari Kurta",            price: 1349, mrp: 3299, disc: 59, by: "Sunita R.",     img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop", rating: 4.6, reviews: 421, colors: ["White","Pink"], sizes: ["S","M","L","XL","XXL"], fabric: "Cotton", pattern: "Chikankari", occasion: "Festive" },
  { id: 7,  title: "Mirror Work Kurti",           price: 949,  mrp: 2199, disc: 57, by: "Priya D.",      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop", rating: 4.0, reviews: 67,  colors: ["Blue","Green"], sizes: ["M","L"], fabric: "Cotton", pattern: "Embroidered", occasion: "Festive" },
  { id: 8,  title: "Georgette Tunic Top",         price: 699,  mrp: 1799, disc: 61, by: "Tanya M.",      img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&h=400&fit=crop", rating: 4.3, reviews: 155, colors: ["Black","White"], sizes: ["XS","S","M","L"], fabric: "Georgette", pattern: "Solid", occasion: "Office" },
  { id: 9,  title: "Bandhani Print Kurti",        price: 549,  mrp: 1399, disc: 61, by: "Kavita J.",     img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=300&h=400&fit=crop", rating: 4.1, reviews: 92,  colors: ["Red","Yellow"], sizes: ["S","M","L"], fabric: "Cotton", pattern: "Bandhani", occasion: "Casual" },
  { id: 10, title: "Ikat Woven Kurta",            price: 1249, mrp: 2999, disc: 58, by: "Nandini B.",    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=400&fit=crop", rating: 4.5, reviews: 203, colors: ["Blue","Orange"], sizes: ["M","L","XL"], fabric: "Cotton", pattern: "Woven", occasion: "Festive" },
  { id: 11, title: "Layered Ruffle Kurti",        price: 879,  mrp: 2099, disc: 58, by: "Simran K.",     img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=400&fit=crop", rating: 4.2, reviews: 118, colors: ["Pink","White"], sizes: ["XS","S","M","L"], fabric: "Chiffon", pattern: "Solid", occasion: "Party" },
  { id: 12, title: "Silk Blend Long Kurta",       price: 1599, mrp: 3999, disc: 60, by: "KRITI",         img: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&h=400&fit=crop", rating: 4.7, reviews: 389, colors: ["Purple","Blue"], sizes: ["S","M","L","XL"], fabric: "Silk", pattern: "Solid", occasion: "Wedding" },
  { id: 13, title: "Rayon Straight Kurta",        price: 599,  mrp: 1499, disc: 60, by: "Anjali S.",     img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=400&fit=crop&grayscale", rating: 4.0, reviews: 54, colors: ["Green","Blue"], sizes: ["M","L","XL"], fabric: "Rayon", pattern: "Solid", occasion: "Daily Wear" },
  { id: 14, title: "Floral Printed Kurta Set",    price: 1099, mrp: 2799, disc: 61, by: "Divya A.",      img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=400&fit=crop&blur=1", rating: 4.3, reviews: 201, colors: ["Pink","Orange"], sizes: ["S","M","L"], fabric: "Cotton", pattern: "Printed", occasion: "Casual" },
  { id: 15, title: "Zari Border Kurta",           price: 1449, mrp: 3599, disc: 60, by: "Meera K.",      img: "https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=300&h=400&fit=crop&blur=2", rating: 4.6, reviews: 315, colors: ["Red","Gold"], sizes: ["M","L","XL","XXL"], fabric: "Silk", pattern: "Embroidered", occasion: "Wedding" },
  { id: 16, title: "Palazzo Kurta Dupatta Set",   price: 1299, mrp: 3199, disc: 59, by: "Rashmi V.",     img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop&blur=1", rating: 4.4, reviews: 178, colors: ["Blue","White"], sizes: ["S","M","L"], fabric: "Georgette", pattern: "Printed", occasion: "Festive" },
];

export const mockProducts = baseProducts;

export const filterGroups = [
  {
    label: "PRICE RANGE",
    key: "price",
    type: "radio",
    options: [
      { label: "Under ₹500",        min: 0,    max: 499   },
      { label: "₹500 – ₹1,000",     min: 500,  max: 1000  },
      { label: "₹1,000 – ₹2,000",   min: 1000, max: 2000  },
      { label: "₹2,000 – ₹5,000",   min: 2000, max: 5000  },
      { label: "Above ₹5,000",       min: 5000, max: 99999 },
    ],
  },
  {
    label: "DISCOUNT",
    key: "disc",
    type: "radio",
    options: [
      { label: "10% and above",  min: 10 },
      { label: "20% and above",  min: 20 },
      { label: "40% and above",  min: 40 },
      { label: "50% and above",  min: 50 },
      { label: "60% and above",  min: 60 },
    ],
  },
  {
    label: "SIZE",
    key: "sizes",
    type: "checkbox",
    options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  },
  {
    label: "COLOR",
    key: "colors",
    type: "color",
    options: [
      { name: "Red",    hex: "#E53935" },
      { name: "Blue",   hex: "#1E88E5" },
      { name: "Green",  hex: "#43A047" },
      { name: "Yellow", hex: "#FDD835" },
      { name: "Pink",   hex: "#E91E8C" },
      { name: "Orange", hex: "#FB8C00" },
      { name: "White",  hex: "#F5F5F5", border: true },
      { name: "Black",  hex: "#212121" },
      { name: "Purple", hex: "#8E24AA" },
      { name: "Gold",   hex: "#C9A96E" },
    ],
  },
  {
    label: "PATTERN",
    key: "pattern",
    type: "checkbox",
    options: ["Printed", "Solid", "Embroidered", "Woven", "Bandhani", "Chikankari", "Block Print"],
  },
  {
    label: "FABRIC",
    key: "fabric",
    type: "checkbox",
    options: ["Cotton", "Silk", "Georgette", "Chiffon", "Rayon", "Linen", "Polyester"],
  },
  {
    label: "OCCASION",
    key: "occasion",
    type: "checkbox",
    options: ["Casual", "Festive", "Party", "Wedding", "Office", "Daily Wear"],
  },
];

export const sortOptions = [
  "Relevance",
  "What's New",
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Better Discount",
  "Customer Rating",
];