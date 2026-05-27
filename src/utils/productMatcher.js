import { mockProducts } from "../Data/Navdata.jsx";

/**
 * Filters products based on gender and subcategory.
 * In a real app, products would have gender and category IDs.
 * For this mock, we'll use title/keyword matching as a heuristic.
 */
export const getFilteredProducts = (gender, subcategory) => {
  if (!gender || !subcategory) return [];

  const genderLower = gender.toLowerCase();
  const subcategoryLower = subcategory.toLowerCase();

  return mockProducts.filter((product) => {
    const titleLower = product.title.toLowerCase();
    
    // Heuristic: Check if subcategory keywords exist in title
    // or if the product is generally suitable.
    // Since mockProducts are currently mostly Women's ethnic wear,
    // we'll bias towards that if gender is Women.
    
    const matchesSubcategory = subcategoryLower.split(' ').some(word => 
      word.length > 3 && titleLower.includes(word.toLowerCase())
    ) || titleLower.includes(subcategoryLower);

    // If it's "Women", and product looks like women's wear (Kurta, Kurti, Saree, etc.)
    const isWomensWear = titleLower.includes("kurta") || titleLower.includes("kurti") || titleLower.includes("saree") || titleLower.includes("palazzo") || titleLower.includes("anarkali");
    
    if (genderLower === "women") {
      return isWomensWear && (matchesSubcategory || subcategoryLower === "ethnic wear");
    }
    
    if (genderLower === "men") {
      // For now, mockProducts don't have many men's items, but we'd filter here.
      return !isWomensWear && titleLower.includes("men");
    }

    return matchesSubcategory;
  });
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
