import { readJson } from "../utils/readJson.js";

const products = readJson("data/products.json");

// 🔹 Get all products
export function getAllProducts() {
  return products;
}

// 🔹 Get single product by SKU
export function getProductBySku(sku) {
  return products.find((p) => p.sku === sku);
}

// 🔹 Search products with filters (used by agent)
export function searchProducts(filters = {}) {
  return products.filter((p) => {
    if (filters.category && p.subCategory !== filters.category) return false;

    if (
      filters.skinType &&
      !p.attributes.skinType.includes(filters.skinType)
    )
      return false;

    if (
      filters.skinConcern &&
      !p.attributes.skinConcern.includes(filters.skinConcern)
    )
      return false;

    if (filters.maxPrice && p.price > filters.maxPrice) return false;

    return true;
  });
}
