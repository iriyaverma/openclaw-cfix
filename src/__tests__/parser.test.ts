import { describe, it, expect } from "vitest";
import {
  parseCompilerOutput,
  lookupError,
  extractErrorCode,
  diagnose,
} from "../parser.js";

describe("parseCompilerOutput", () => {
  it("should parse a single GCC error line", () => {
    const output = "main.c:10:5: error: undeclared identifier 'x'";
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(1);
    expect(results[0].file).toBe("main.c");
    expect(results[0].line).toBe(10);
    expect(results[0].column).toBe(5);
    expect(results[0].severity).toBe("error");
    expect(results[0].message).toBe("undeclared identifier 'x'");
  });

  it("should parse a single warning line", () => {
    const output =
      "foo.c:3:1: warning: implicit declaration of function 'bar'";
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe("warning");
    expect(results[0].file).toBe("foo.c");
  });

  it("should parse multiple errors and warnings", () => {
    const output = [
      "main.c:1:1: error: expected ';' after expression",
      "main.c:5:10: warning: unused variable 'x'",
      "main.c:8:3: error: undeclared identifier 'y'",
    ].join("\n");
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(3);
    expect(results[0].severity).toBe("error");
    expect(results[1].severity).toBe("warning");
    expect(results[2].severity).toBe("error");
  });

  it("should parse a linker undefined reference error", () => {
    const output = "undefined reference to `helper'";
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe("error");
    expect(results[0].message).toContain("undefined reference");
  });

  it("should parse a segmentation fault", () => {
    const output = "Segmentation fault (core dumped)";
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe("error");
    expect(results[0].message).toContain("Segmentation fault");
  });

  it("should handle empty output", () => {
    const results = parseCompilerOutput("");
    expect(results).toHaveLength(0);
  });

  it("should skip non-matching lines", () => {
    const output = [
      "In file included from main.c:1:",
      "main.c:5:3: error: too few arguments to function 'add'",
      "       int result = add(5);",
      "                    ^~~",
    ].join("\n");
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain("too few arguments");
  });

  it("should parse note severity", () => {
    const output = "main.c:2:5: note: declared here";
    const results = parseCompilerOutput(output);
    expect(results).toHaveLength(1);
    expect(results[0].severity).toBe("note");
  });
});

describe("lookupError", () => {
  it("should match by pattern for undeclared identifier", () => {
    const result = lookupError("use of undeclared identifier 'x'");
    expect(result).toBeDefined();
    expect(result!.code).toBe("E-undeclared-identifier");
  });

  it("should match by pattern for implicit declaration", () => {
    const result = lookupError(
      "implicit declaration of function 'printf'",
    );
    expect(result).toBeDefined();
    expect(result!.code).toBe("W-implicit-function-declaration");
  });

  it("should return undefined for unrecognized message", () => {
    const result = lookupError("completely unknown error xyz");
    expect(result).toBeUndefined();
  });

  it("should match unused variable warning", () => {
    const result = lookupError("unused variable 'tmp'");
    expect(result).toBeDefined();
    expect(result!.code).toBe("W-unused-variable");
  });
});

describe("extractErrorCode", () => {
  it("should extract warning flag from GCC output", () => {
    const code = extractErrorCode(
      "unused variable 'x' [-Wunused-variable]",
    );
    expect(code).toBe("unused-variable");
  });

  it("should return undefined when no flag present", () => {
    const code = extractErrorCode("undeclared identifier 'x'");
    expect(code).toBeUndefined();
  });
});

describe("diagnose", () => {
  it("should return FixResults for compiler output", () => {
    const output = "main.c:10:5: error: undeclared identifier 'x'";
    const results = diagnose(output);
    expect(results).toHaveLength(1);
    expect(results[0].parsed.severity).toBe("error");
    expect(results[0].matched).toBeDefined();
    expect(results[0].matched!.code).toBe("E-undeclared-identifier");
  });
});
