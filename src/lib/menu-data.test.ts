import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMenu, parseActive, parseSheetCsv, pickFeatured } from "./menu-data.ts";
import type { SheetData, SheetItem, SheetSection } from "./menu-data.ts";

const section = (overrides: Partial<SheetSection>): SheetSection => ({
  key: "s",
  title: "Section",
  icon: "🍹",
  color: "text-red-600",
  active: "1",
  orderIndex: "0",
  ...overrides,
});

const item = (overrides: Partial<SheetItem>): SheetItem => ({
  id: "1",
  sectionKey: "s",
  subsectionId: "",
  name: "Item",
  description: "",
  price: "",
  emoji: "🍹",
  bgColor: "bg-red-100",
  image: "",
  active: "1",
  orderIndex: "0",
  ...overrides,
});

const sheet = (overrides: Partial<SheetData>): SheetData => ({
  sections: [],
  sizes: [],
  subsections: [],
  items: [],
  ...overrides,
});

test("parseActive accepts only explicit truthy values", () => {
  for (const value of ["1", "true", "TRUE", " sí ", "si", "yes"]) {
    assert.equal(parseActive(value), true, value);
  }
  for (const value of ["0", "", "false", "FALSE", "no", undefined]) {
    assert.equal(parseActive(value), false, String(value));
  }
});

test("buildMenu drops inactive sections and items", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "a" }), section({ key: "b", active: "0" })],
      items: [
        item({ id: "1", sectionKey: "a", name: "Shown" }),
        item({ id: "2", sectionKey: "a", name: "Hidden", active: "0" }),
        item({ id: "3", sectionKey: "b", name: "In hidden section" }),
      ],
    }),
  );
  assert.deepEqual(menu.map((s) => s.key), ["a"]);
  assert.deepEqual(menu[0].items.map((i) => i.name), ["Shown"]);
});

test("buildMenu sorts sections and items by orderIndex", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "late", orderIndex: "5" }), section({ key: "early", orderIndex: "1" })],
      items: [
        item({ id: "1", sectionKey: "late", name: "B", orderIndex: "2" }),
        item({ id: "2", sectionKey: "late", name: "A", orderIndex: "1" }),
        item({ id: "3", sectionKey: "early" }),
      ],
    }),
  );
  assert.deepEqual(menu.map((s) => s.key), ["early", "late"]);
  assert.deepEqual(menu[1].items.map((i) => i.name), ["A", "B"]);
});

test("buildMenu attaches sizes, groups subsection items and drops empty sections", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "esp" }), section({ key: "empty" })],
      sizes: [{ sectionKey: "esp", size: "16 oz", price: "$15.000" }],
      subsections: [
        { id: "10", sectionKey: "esp", title: "Frutales", orderIndex: "0" },
        { id: "11", sectionKey: "esp", title: "Sin items", orderIndex: "1" },
      ],
      items: [item({ id: "1", sectionKey: "esp", subsectionId: "10", name: "Mango", price: "$16.000" })],
    }),
  );
  assert.equal(menu.length, 1);
  assert.deepEqual(menu[0].sizes, [{ size: "16 oz", price: "$15.000" }]);
  assert.deepEqual(menu[0].items, []);
  assert.deepEqual(menu[0].subsections.map((s) => s.title), ["Frutales"]);
  assert.equal(menu[0].subsections[0].items[0].price, "$16.000");
  assert.equal(menu[0].subsections[0].items[0].description, undefined);
});

test("pickFeatured keeps items with images, dedupes by name and respects the limit", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "sin" }), section({ key: "con", orderIndex: "1" })],
      items: [
        item({ id: "1", sectionKey: "sin", name: "Mora Azul", image: "/img/a.png" }),
        item({ id: "2", sectionKey: "sin", name: "Sin foto" }),
        item({ id: "3", sectionKey: "sin", name: "Lulo", image: "/img/b.png", orderIndex: "1" }),
        item({ id: "4", sectionKey: "con", name: "mora azul", image: "/img/a.png" }),
        item({ id: "5", sectionKey: "con", name: "Sandía", image: "/img/c.png", orderIndex: "1" }),
      ],
    }),
  );
  const keys = ["sin", "con"];
  assert.deepEqual(pickFeatured(menu, keys).map((d) => d.name), ["Mora Azul", "Lulo", "Sandía"]);
  assert.deepEqual(pickFeatured(menu, keys, 2).map((d) => d.id), [1, 3]);
});

test("pickFeatured skips sections outside sectionKeys", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "extras" }), section({ key: "sin", orderIndex: "1" })],
      items: [
        item({ id: "1", sectionKey: "extras", name: "Topping", image: "/img/t.png" }),
        item({ id: "2", sectionKey: "sin", name: "Lulo", image: "/img/b.png" }),
      ],
    }),
  );
  assert.deepEqual(pickFeatured(menu, ["sin"]).map((d) => d.name), ["Lulo"]);
});

test("buildMenu groups subsection items that only have subsectionId (live Especiales shape)", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "especiales" })],
      subsections: [{ id: "10", sectionKey: "especiales", title: "Clásicos", orderIndex: "0" }],
      items: [item({ id: "1", sectionKey: "", subsectionId: "10", name: "Mojito" })],
    }),
  );
  assert.equal(menu[0].subsections[0].title, "Clásicos");
  assert.deepEqual(menu[0].subsections[0].items.map((i) => i.name), ["Mojito"]);
});

test("parseSheetCsv returns typed rows", () => {
  const rows = parseSheetCsv<{ id: string; name: string }>("id,name\n1,Lulo\n2,Mora\n", "items", "id");
  assert.deepEqual(rows, [{ id: "1", name: "Lulo" }, { id: "2", name: "Mora" }]);
});

test("parseSheetCsv returns [] for an empty tab", () => {
  assert.deepEqual(parseSheetCsv("", "items", "id"), []);
  assert.deepEqual(parseSheetCsv("  \n", "items", "id"), []);
});

test("parseSheetCsv drops ragged rows and keeps the rest", () => {
  const rows = parseSheetCsv<{ id: string; name: string }>("id,name\n1,Lulo\n2\n3,Mora,extra\n4,Sandía\n", "items", "id");
  assert.deepEqual(rows.map((r) => r.id), ["1", "4"]);
});

test("parseSheetCsv throws when the key column is missing (e.g. an HTML error page)", () => {
  assert.throws(
    () => parseSheetCsv("<!DOCTYPE html><html><body>Error</body></html>", "items", "id"),
    /missing the "id" column/,
  );
});

test("buildMenu ignores images that are not local paths", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "s" })],
      items: [
        item({ id: "1", name: "Remote", image: "https://example.com/a.png" }),
        item({ id: "2", name: "Local", image: "/img/b.png" }),
        item({ id: "3", name: "ProtocolRelative", image: "//cdn.example.com/c.png" }),
      ],
    }),
  );
  assert.deepEqual(menu[0].items.map((i) => i.image), [undefined, "/img/b.png", undefined]);
  assert.deepEqual(pickFeatured(menu, ["s"]).map((d) => d.name), ["Local"]);
});
