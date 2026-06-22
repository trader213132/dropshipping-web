import { describe, it, expect } from "vitest";
import { slugify, truncate, formatCurrency, generateId, pick, omit, groupBy } from "@/lib/utils";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Café & Co.")).toBe("caf-co");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });
});

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });
});

describe("formatCurrency", () => {
  it("formats USD", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });
});

describe("generateId", () => {
  it("generates a non-empty string", () => {
    expect(generateId()).toBeTruthy();
  });

  it("includes prefix when provided", () => {
    expect(generateId("ws").startsWith("ws_")).toBe(true);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("pick", () => {
  it("returns only the selected keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });
});

describe("omit", () => {
  it("removes the specified keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });
});

describe("groupBy", () => {
  it("groups items by key", () => {
    const items = [
      { type: "a", val: 1 },
      { type: "b", val: 2 },
      { type: "a", val: 3 },
    ];
    const result = groupBy(items, "type");
    expect(result["a"]).toHaveLength(2);
    expect(result["b"]).toHaveLength(1);
  });
});
