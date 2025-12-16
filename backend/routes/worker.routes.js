import express from "express";
import { getAllProducts, getProductBySku } from "../services/product.service.js";

const router = express.Router();

/**
 * Product Worker
 * Internal capability for the Sales Agent
 */

// GET all products
router.get("/products", (req, res) => {
  const products = getAllProducts();
  res.json(products);
});

// GET product by SKU
router.get("/products/:sku", (req, res) => {
  const product = getProductBySku(req.params.sku);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

export default router;
