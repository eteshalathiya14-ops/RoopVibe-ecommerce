import { navLinks } from "../Data/Navdata.jsx";
import { toSlug } from "./slug.js";

/**
 * Generates a flat index of all subcategories for efficient lookup.
 * Key format: "gender/subcategory-slug"
 * Value: { gender, subcategoryLabel, title }
 */
const generateCategoryIndex = () => {
  const index = {};

  navLinks.forEach((category) => {
    if (!category.mega) return;

    const gender = category.name.toLowerCase();

    category.mega.columns.forEach((column) => {
      // Process main items
      if (column.items) {
        column.items.forEach((item) => {
          const slug = toSlug(item);
          index[`${gender}/${slug}`] = {
            gender: category.name,
            subcategory: item,
            title: item,
            group: column.title,
          };
        });
      }

      // Process extra groups if they exist
      if (column.extra) {
        column.extra.forEach((extraGroup) => {
          extraGroup.items.forEach((item) => {
            const slug = toSlug(item);
            index[`${gender}/${slug}`] = {
              gender: category.name,
              subcategory: item,
              title: item,
              group: extraGroup.title,
            };
          });
        });
      }
    });
  });

  return index;
};

export const categoryIndex = generateCategoryIndex();

export const getCategoryByParams = (genderSlug, subcategorySlug) => {
  const key = `${genderSlug.toLowerCase()}/${subcategorySlug.toLowerCase()}`;
  return categoryIndex[key];
};
