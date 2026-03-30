import type { ParsedError, FixResult } from "./types.js";
import { findByCode, findByPattern } from "./errors.js";

const GCC_CLANG_RE =
  /^(.+?):(\d+):(\d+):\s+(error|warning|note):\s+(.+)$/;

const LINKER_UNDEFINED_RE =
  /undefined reference to [`'"]?(\w+)[`'"]?/;

const LINKER_MULTIPLE_RE = /multiple definition of [`'"]?(\w+)[`'"]?/;

const SEGFAULT_RE = /[Ss]egmentation fault/;

export function parseCompilerOutput(output: string): ParsedError[] {
  const results: ParsedError[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const gccMatch = trimmed.match(GCC_CLANG_RE);
    if (gccMatch) {
      results.push({
        file: gccMatch[1],
        line: parseInt(gccMatch[2], 10),
        column: parseInt(gccMatch[3], 10),
        severity: gccMatch[4] as ParsedError["severity"],
        message: gccMatch[5],
        rawLine: trimmed,
      });
      continue;
    }

    if (LINKER_UNDEFINED_RE.test(trimmed)) {
      results.push({
        file: "",
        line: 0,
        column: 0,
        severity: "error",
        message: trimmed,
        rawLine: trimmed,
      });
      continue;
    }

    if (LINKER_MULTIPLE_RE.test(trimmed)) {
      results.push({
        file: "",
        line: 0,
        column: 0,
        severity: "error",
        message: trimmed,
        rawLine: trimmed,
      });
      continue;
    }

    if (SEGFAULT_RE.test(trimmed)) {
      results.push({
        file: "",
        line: 0,
        column: 0,
        severity: "error",
        message: trimmed,
        rawLine: trimmed,
      });
    }
  }

  return results;
}

export function lookupError(message: string): FixResult["matched"] {
  const codeMatch = message.match(
    /\[-W([\w-]+)\]|\[-([\w-]+)\]/,
  );
  if (codeMatch) {
    const flagName = codeMatch[1] ?? codeMatch[2];
    const byCode = findByCode(`W-${flagName}`) ?? findByCode(`E-${flagName}`);
    if (byCode) return byCode;
  }

  const byPattern = findByPattern(message);
  if (byPattern) return byPattern;

  return undefined;
}

export function extractErrorCode(message: string): string | undefined {
  const codeMatch = message.match(
    /\[-W([\w-]+)\]|\[-([\w-]+)\]/,
  );
  if (codeMatch) {
    return codeMatch[1] ?? codeMatch[2];
  }
  return undefined;
}

export function diagnose(output: string): FixResult[] {
  const parsed = parseCompilerOutput(output);
  return parsed.map((p) => ({
    parsed: p,
    matched: lookupError(p.message),
  }));
}
