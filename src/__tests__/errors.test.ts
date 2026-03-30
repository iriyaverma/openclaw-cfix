import { describe, it, expect } from "vitest";
import {
  C_ERRORS,
  findByCode,
  findByPattern,
  findByCategory,
  listCategories,
} from "../errors.js";
import type { ErrorCategory } from "../types.js";

describe("C_ERRORS database", () => {
  it("should contain at least 25 entries", () => {
    expect(C_ERRORS.length).toBeGreaterThanOrEqual(25);
  });

  it("should have no duplicate codes", () => {
    const codes = C_ERRORS.map((e) => e.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it("should have all required fields on every entry", () => {
    for (const err of C_ERRORS) {
      expect(typeof err.code).toBe("string");
      expect(err.code.length).toBeGreaterThan(0);
      expect(typeof err.title).toBe("string");
      expect(err.title.length).toBeGreaterThan(0);
      expect(typeof err.category).toBe("string");
      expect(err.pattern).toBeInstanceOf(RegExp);
      expect(typeof err.explanation).toBe("string");
      expect(Array.isArray(err.fixes)).toBe(true);
      expect(err.fixes.length).toBeGreaterThan(0);
      expect(typeof err.example.bad).toBe("string");
      expect(typeof err.example.good).toBe("string");
      expect(typeof err.docUrl).toBe("string");
      expect(err.docUrl).toMatch(/^https?:\/\//);
      expect(["easy", "medium", "hard"]).toContain(err.difficulty);
    }
  });

  it("should have valid categories on every entry", () => {
    const validCategories: ErrorCategory[] = [
      "pointer",
      "memory",
      "type",
      "syntax",
      "preprocessor",
      "linker",
      "array",
      "undefined-behavior",
      "declaration",
      "misc",
    ];
    for (const err of C_ERRORS) {
      expect(validCategories).toContain(err.category);
    }
  });

  it("should have codes that start with E- or W-", () => {
    for (const err of C_ERRORS) {
      expect(err.code).toMatch(/^(E|W)-/);
    }
  });
});

describe("findByCode", () => {
  it("should find an error by exact code", () => {
    const result = findByCode("E-segfault");
    expect(result).toBeDefined();
    expect(result!.code).toBe("E-segfault");
    expect(result!.title).toBe("Segmentation Fault");
  });

  it("should be case-insensitive", () => {
    const result = findByCode("e-SEGFAULT");
    expect(result).toBeDefined();
    expect(result!.code).toBe("E-segfault");
  });

  it("should return undefined for unknown codes", () => {
    const result = findByCode("X-nonexistent-error");
    expect(result).toBeUndefined();
  });

  it("should find W-format", () => {
    const result = findByCode("W-format");
    expect(result).toBeDefined();
    expect(result!.category).toBe("type");
  });

  it("should find E-undefined-reference", () => {
    const result = findByCode("E-undefined-reference");
    expect(result).toBeDefined();
    expect(result!.category).toBe("linker");
  });
});

describe("findByPattern", () => {
  it("should match segfault message", () => {
    const result = findByPattern("Segmentation fault (core dumped)");
    expect(result).toBeDefined();
    expect(result!.code).toBe("E-segfault");
  });

  it("should match implicit function declaration message", () => {
    const result = findByPattern("implicit declaration of function 'printf'");
    expect(result).toBeDefined();
    expect(result!.code).toBe("W-implicit-function-declaration");
  });

  it("should match undefined reference message", () => {
    const result = findByPattern("undefined reference to `main'");
    expect(result).toBeDefined();
    expect(result!.code).toBe("E-undefined-reference");
  });

  it("should return undefined for unrecognized messages", () => {
    const result = findByPattern("some random string that matches nothing");
    expect(result).toBeUndefined();
  });
});

describe("findByCategory", () => {
  it("should find all memory errors", () => {
    const results = findByCategory("memory");
    expect(results.length).toBeGreaterThan(0);
    for (const err of results) {
      expect(err.category).toBe("memory");
    }
  });

  it("should find all pointer errors", () => {
    const results = findByCategory("pointer");
    expect(results.length).toBeGreaterThan(0);
    for (const err of results) {
      expect(err.category).toBe("pointer");
    }
  });

  it("should return empty array for non-existent category", () => {
    const results = findByCategory("nonexistent" as ErrorCategory);
    expect(results).toHaveLength(0);
  });
});

describe("listCategories", () => {
  it("should return all unique categories", () => {
    const categories = listCategories();
    expect(categories.length).toBeGreaterThan(0);
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });

  it("should include core categories", () => {
    const categories = listCategories();
    expect(categories).toContain("memory");
    expect(categories).toContain("pointer");
    expect(categories).toContain("syntax");
    expect(categories).toContain("linker");
    expect(categories).toContain("type");
  });
});
