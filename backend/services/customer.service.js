import { readJson } from "../utils/readJson.js";

/**
 * Load all customers from JSON
 */
function loadCustomers() {
  return readJson("data/customers.json") || [];
}

/**
 * Get all customers (for frontend dropdown)
 */
export function getAllCustomers() {
  return loadCustomers();
}

/**
 * Get single customer by customer_id
 */
export function getCustomerById(customerId) {
  return loadCustomers().find(
    (c) => c.customer_id === customerId
  );
}
