import assert from "node:assert/strict";
import test from "node:test";
import { viewedPreferences } from "../src/recommendationPreferences.js";

test("recommends the same brand within twenty percent of the viewed price", () => {
  assert.deepEqual(viewedPreferences({ priceAmount: 500_000_000, vehicle: { brandId: 7 } }), {
    brandId: 7,
    minPrice: 400_000_000,
    maxPrice: 600_000_000,
  });
});

test("ignores listings without a usable brand and price", () => {
  assert.equal(viewedPreferences({ priceAmount: 0, vehicle: { brandId: 7 } }), null);
  assert.equal(viewedPreferences({ priceAmount: 500_000_000, vehicle: {} }), null);
});
