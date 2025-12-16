import express from "express";
import { getAllProducts, getProductBySku } from "../services/product.service.js";
import { getAllCustomers, getCustomerById } from "../services/customer.service.js";

const router = express.Router();

/**
 * Worker APIs
 * Used by frontend + agent orchestration
 */

// -------------------- PRODUCTS --------------------

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

// -------------------- CUSTOMERS --------------------

// GET all customers (for frontend dropdown)
router.get("/customers", (req, res) => {
  const customers = getAllCustomers();

  // send minimal fields only (demo-safe)
  const safeCustomers = customers.map(c => ({
    customer_id: c.customer_id,
    name: c.name,
    loyalty_tier: c.loyalty_tier,
    preferred_channel: c.preferred_channel
  }));

  res.json(safeCustomers);
});

// GET customer by ID (optional / future use)
router.get("/customers/:id", (req, res) => {
  const customer = getCustomerById(req.params.id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json(customer);
});

export default router;
