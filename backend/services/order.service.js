import { readJson, writeJson } from "../utils/readJson.js";

export function getOrdersByCustomer(customerId) {
  return readJson("orders.json").filter(o => o.customerId === customerId);
}

export function createOrder(order) {
  const orders = readJson("orders.json");
  orders.push(order);
  writeJson("orders.json", orders);
  return order;
}
