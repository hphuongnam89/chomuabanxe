import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnTo } from "../src/authNavigation.js";

test("accepts an internal return path", () => {
  assert.equal(safeReturnTo("/dang-tin?draft=1"), "/dang-tin?draft=1");
});

test("rejects external or malformed return paths", () => {
  for (const value of ["https://evil.test", "//evil.test", "/\\evil.test", " /admin"])
    assert.equal(safeReturnTo(value), null);
});
