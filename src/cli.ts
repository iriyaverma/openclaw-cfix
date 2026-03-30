import { C_ERRORS, findByCode, findByCategory, listCategories } from "./errors.js";
import { formatErrorList, formatCategoryList } from "./formatter.js";
import { diagnose } from "./parser.js";
import { formatMultipleResults } from "./formatter.js";
import type { ErrorCategory } from "./types.js";

export interface CliContext {
  args: string[];
  stdout: (msg: string) => void;
  stderr: (msg: string) => void;
}

export function runCli(ctx: CliContext): number {
  const [subcommand, ...rest] = ctx.args;

  switch (subcommand) {
    case "errors": {
      const category = rest[0] as ErrorCategory | undefined;
      if (category) {
        const errors = findByCategory(category);
        if (errors.length === 0) {
          ctx.stderr(`No errors found for category: ${category}`);
          return 1;
        }
        ctx.stdout(formatErrorList(errors));
      } else {
        ctx.stdout(formatErrorList(C_ERRORS));
      }
      return 0;
    }

    case "lookup": {
      const code = rest[0];
      if (!code) {
        ctx.stderr("Usage: cfix lookup <error-code>");
        return 1;
      }
      const error = findByCode(code);
      if (!error) {
        ctx.stderr(`Unknown error code: ${code}`);
        return 1;
      }
      ctx.stdout(`## ${error.title} (\`${error.code}\`)\n`);
      ctx.stdout(`**Category:** ${error.category}`);
      ctx.stdout(`**Difficulty:** ${error.difficulty}\n`);
      ctx.stdout(`${error.explanation}\n`);
      ctx.stdout("**Fixes:**");
      for (const fix of error.fixes) {
        ctx.stdout(`  - ${fix}`);
      }
      return 0;
    }

    case "categories": {
      const categories = listCategories();
      ctx.stdout(formatCategoryList(categories));
      return 0;
    }

    default: {
      ctx.stderr("Usage: cfix <errors|lookup|categories> [args...]");
      return 1;
    }
  }
}
