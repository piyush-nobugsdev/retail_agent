import { readJson } from "../utils/readJson.js";

/**
 * Internal helper to always get fresh products
 */
function loadProducts() {
  return readJson("data/products.json") || [];
}

// 🔹 Get all products
export function getAllProducts() {
  return loadProducts();
}

// 🔹 Get single product by SKU
export function getProductBySku(sku) {
  return loadProducts().find(p => p.sku === sku);
}

// 🔹 Search products with filters (used by agent)
export function searchProducts(filters = {}) {
  const products = loadProducts();

  return products.filter(p => {
    if (filters.category && p.subCategory !== filters.category) {
      return false;
    }

    if (
      filters.skinType &&
      (!p.attributes?.skinType ||
        !p.attributes.skinType.includes(filters.skinType))
    ) {
      return false;
    }

    if (
      filters.skinConcern &&
      (!p.attributes?.skinConcern ||
        !p.attributes.skinConcern.includes(filters.skinConcern))
    ) {
      return false;
    }

    if (filters.maxPrice && p.price > filters.maxPrice) {
      return false;
    }

    return true;
  });
}
