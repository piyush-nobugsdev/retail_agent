import { readJson } from "../utils/readJson.js";

export function getEligibleOffers(customerTier) {
  const offers = readJson("offers.json");
  return offers.filter(o =>
    !o.eligibleTiers || o.eligibleTiers.includes(customerTier)
  );
}
