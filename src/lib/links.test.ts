import { test } from "node:test";
import assert from "node:assert/strict";
import { mapsEmbedUrl, mapsSearchUrl, whatsappUrl } from "./links.ts";

test("whatsappUrl strips non-digits and encodes the message", () => {
  assert.equal(
    whatsappUrl("+57 318-031-8210", "¡Hola HK! 🍹"),
    `https://wa.me/573180318210?text=${encodeURIComponent("¡Hola HK! 🍹")}`,
  );
});

test("whatsappUrl without a message has no query string", () => {
  assert.equal(whatsappUrl("573180318210"), "https://wa.me/573180318210");
});

test("maps urls encode the query", () => {
  assert.equal(mapsEmbedUrl("Calle 28 # 24A"), "https://www.google.com/maps?q=Calle%2028%20%23%2024A&output=embed");
  assert.equal(
    mapsSearchUrl("Calle 28 # 24A"),
    "https://www.google.com/maps/search/?api=1&query=Calle%2028%20%23%2024A",
  );
});
