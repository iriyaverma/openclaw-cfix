export type ErrorCategory =
  | "pointer"
  | "memory"
  | "type"
  | "syntax"
  | "preprocessor"
  | "linker"
  | "array"
  | "undefined-behavior"
  | "declaration"
  | "misc";

export type Difficulty = "easy" | "medium" | "hard";

export interface CError {
  code: string;
  title: string;
  category: ErrorCategory;
  pattern: RegExp;
  explanation: string;
  fixes: string[];
  example: {
    bad: string;
    good: string;
  };
  docUrl: string;
  difficulty: Difficulty;
}

export interface ParsedError {
  file: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "note";
  message: string;
  rawLine: string;
}

export interface FixResult {
  parsed: ParsedError;
  matched: CError | undefined;
}
