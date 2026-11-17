import { test } from "node:test";
import assert from "node:assert/strict";
import { neonTone } from "./neon.ts";

test("neonTone reads the color name from sheet bg and text classes", () => {
  assert.deepEqual(neonTone("bg-blue-100"), { text: "text-blue-400", glow: "glow-blue-400" });
  assert.deepEqual(neonTone("text-red-600"), { text: "text-red-400", glow: "glow-red-400" });
  assert.deepEqual(neonTone(" bg-gray-200 "), { text: "text-gray-400", glow: "glow-gray-400" });
});

test("neonTone falls back to magenta for missing or unknown classes", () => {
  const fallback = { text: "text-hk-magenta", glow: "glow-hk-magenta" };
  assert.deepEqual(neonTone(undefined), fallback);
  assert.deepEqual(neonTone(""), fallback);
  assert.deepEqual(neonTone("bg-[#123456]"), fallback);
  assert.deepEqual(neonTone("bg-chartreuse-100"), fallback);
});
