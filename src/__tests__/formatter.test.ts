import { describe, it, expect } from "vitest";
import {
  formatFixResult,
  formatErrorList,
  formatMultipleResults,
  formatCategoryList,
} from "../formatter.js";
import type { FixResult, CError, ErrorCategory } from "../types.js";

function makeParsedError(overrides: Partial<FixResult["parsed"]> = {}): FixResult["parsed"] {
  return {
    file: "main.c",
    line: 10,
    column: 5,
    severity: "error",
    message: "undeclared identifier 'x'",
    rawLine: "main.c:10:5: error: undeclared identifier 'x'",
    ...overrides,
  };
}

function makeMatchedError(overrides: Partial<CError> = {}): CError {
  return {
    code: "E-undeclared-identifier",
    title: "Undeclared Identifier",
    category: "declaration",
    pattern: /undeclared/,
    explanation: "A variable was used but not declared.",
    fixes: ["Declare the variable before use"],
    example: { bad: "x = 5;", good: "int x = 5;" },
    docUrl: "https://gcc.gnu.org/docs",
    difficulty: "easy",
    ...overrides,
  };
}

describe("formatFixResult", () => {
  it("should format a matched result with file location", () => {
    const result: FixResult = {
      parsed: makeParsedError(),
      matched: makeMatchedError(),
    };
    const output = formatFixResult(result);
    expect(output).toContain("ERROR");
    expect(output).toContain("main.c");
    expect(output).toContain("line 10:5");
    expect(output).toContain("Undeclared Identifier");
    expect(output).toContain("Declare the variable before use");
    expect(output).toContain("```c");
    expect(output).toContain("int x = 5;");
  });

  it("should format a matched result without file location", () => {
    const result: FixResult = {
      parsed: makeParsedError({ file: "", line: 0, column: 0 }),
      matched: makeMatchedError(),
    };
    const output = formatFixResult(result);
    expect(output).toContain("## ERROR");
    expect(output).not.toContain("main.c");
  });

  it("should format a fallback result when no match found", () => {
    const result: FixResult = {
      parsed: makeParsedError(),
      matched: undefined,
    };
    const output = formatFixResult(result);
    expect(output).toContain("No matching error pattern found");
    expect(output).toContain("General tips");
    expect(output).toContain("-Wall -Wextra");
  });

  it("should include difficulty and category for matched errors", () => {
    const result: FixResult = {
      parsed: makeParsedError(),
      matched: makeMatchedError({ difficulty: "hard", category: "memory" }),
    };
    const output = formatFixResult(result);
    expect(output).toContain("memory");
    expect(output).toContain("hard");
  });

  it("should include documentation link for matched errors", () => {
    const result: FixResult = {
      parsed: makeParsedError(),
      matched: makeMatchedError({ docUrl: "https://example.com/docs" }),
    };
    const output = formatFixResult(result);
    expect(output).toContain("[Documentation](https://example.com/docs)");
  });
});

describe("formatErrorList", () => {
  it("should format a list of errors as a markdown table", () => {
    const errors: CError[] = [makeMatchedError()];
    const output = formatErrorList(errors);
    expect(output).toContain("Code");
    expect(output).toContain("Title");
    expect(output).toContain("E-undeclared-identifier");
    expect(output).toContain("Undeclared Identifier");
  });

  it("should return a message when no errors are provided", () => {
    const output = formatErrorList([]);
    expect(output).toContain("No errors found");
  });
});

describe("formatMultipleResults", () => {
  it("should format multiple results with a header", () => {
    const results: FixResult[] = [
      { parsed: makeParsedError(), matched: makeMatchedError() },
      {
        parsed: makeParsedError({
          message: "implicit declaration of function 'printf'",
          severity: "warning",
        }),
        matched: makeMatchedError({
          code: "W-implicit-function-declaration",
          title: "Implicit Function Declaration",
        }),
      },
    ];
    const output = formatMultipleResults(results);
    expect(output).toContain("Found 2 issues");
    expect(output).toContain("Undeclared Identifier");
    expect(output).toContain("Implicit Function Declaration");
    expect(output).toContain("---");
  });

  it("should handle a single result", () => {
    const results: FixResult[] = [
      { parsed: makeParsedError(), matched: makeMatchedError() },
    ];
    const output = formatMultipleResults(results);
    expect(output).toContain("Found 1 issue");
    expect(output).not.toContain("issues");
  });

  it("should return a message when no results", () => {
    const output = formatMultipleResults([]);
    expect(output).toContain("No errors detected");
  });
});

describe("formatCategoryList", () => {
  it("should format categories as a markdown list", () => {
    const categories: ErrorCategory[] = ["memory", "pointer", "syntax"];
    const output = formatCategoryList(categories);
    expect(output).toContain("CFix Error Categories");
    expect(output).toContain("**memory**");
    expect(output).toContain("**pointer**");
    expect(output).toContain("**syntax**");
  });
});
