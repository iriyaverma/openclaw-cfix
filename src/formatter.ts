import type { CError, FixResult, ErrorCategory } from "./types.js";

export function formatFixResult(result: FixResult): string {
  const { parsed, matched } = result;
  const lines: string[] = [];

  if (parsed.file) {
    lines.push(
      `## ${parsed.severity.toUpperCase()} in \`${parsed.file}\` at line ${parsed.line}:${parsed.column}`,
    );
  } else {
    lines.push(`## ${parsed.severity.toUpperCase()}`);
  }

  lines.push("");
  lines.push(`> ${parsed.message}`);
  lines.push("");

  if (matched) {
    lines.push(`### ${matched.title} (\`${matched.code}\`)`);
    lines.push("");
    lines.push(`**Category:** ${matched.category} | **Difficulty:** ${matched.difficulty}`);
    lines.push("");
    lines.push(`**Explanation:** ${matched.explanation}`);
    lines.push("");
    lines.push("**Fixes:**");
    for (const fix of matched.fixes) {
      lines.push(`- ${fix}`);
    }
    lines.push("");
    lines.push("**Bad:**");
    lines.push("```c");
    lines.push(matched.example.bad);
    lines.push("```");
    lines.push("");
    lines.push("**Good:**");
    lines.push("```c");
    lines.push(matched.example.good);
    lines.push("```");
    lines.push("");
    lines.push(`[Documentation](${matched.docUrl})`);
  } else {
    lines.push("*No matching error pattern found in the CFix database.*");
    lines.push("");
    lines.push("**General tips:**");
    lines.push("- Read the error message carefully — the compiler is often very specific");
    lines.push("- Check the line number and the line above it");
    lines.push("- Compile with `-Wall -Wextra` for more diagnostics");
  }

  return lines.join("\n");
}

export function formatErrorList(errors: CError[]): string {
  if (errors.length === 0) {
    return "No errors found for this category.";
  }

  const lines: string[] = [];
  lines.push(`| Code | Title | Difficulty |`);
  lines.push(`|------|-------|------------|`);
  for (const err of errors) {
    lines.push(`| \`${err.code}\` | ${err.title} | ${err.difficulty} |`);
  }
  return lines.join("\n");
}

export function formatMultipleResults(results: FixResult[]): string {
  if (results.length === 0) {
    return "No errors detected in the compiler output.";
  }

  const lines: string[] = [];
  lines.push(`# CFix: Found ${results.length} issue${results.length === 1 ? "" : "s"}`);
  lines.push("");

  for (const result of results) {
    lines.push(formatFixResult(result));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function formatCategoryList(categories: ErrorCategory[]): string {
  const lines: string[] = [];
  lines.push("## CFix Error Categories");
  lines.push("");
  for (const cat of categories) {
    lines.push(`- **${cat}**`);
  }
  return lines.join("\n");
}
