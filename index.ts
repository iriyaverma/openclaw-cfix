import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import { diagnose, lookupError } from "./src/parser.js";
import { findByCode, findByCategory, listCategories, C_ERRORS } from "./src/errors.js";
import {
  formatMultipleResults,
  formatFixResult,
  formatErrorList,
  formatCategoryList,
} from "./src/formatter.js";
import { runCli } from "./src/cli.js";
import type { ErrorCategory, FixResult } from "./src/types.js";

export default definePluginEntry({
  id: "cfix",
  name: "CFix",
  version: "1.0.0",
  description: "Diagnose and fix C/GCC/Clang compiler errors and warnings",

  init(api) {
    api.registerCli({
      commands: ["cfix"],
      handler(args, ctx) {
        return runCli({
          args,
          stdout: (msg) => ctx.stdout(msg),
          stderr: (msg) => ctx.stderr(msg),
        });
      },
    });

    if (api.registrationMode === "cli-metadata") return;

    api.registerTool({
      name: "c_fix",
      description:
        "Paste GCC/Clang compiler output to get explanations and fixes for each error and warning.",
      inputSchema: Type.Object({
        compiler_output: Type.String({
          description: "Raw compiler output from GCC or Clang",
        }),
      }),
      async handler({ compiler_output }) {
        const results = diagnose(compiler_output);
        return formatMultipleResults(results);
      },
    });

    api.registerTool({
      name: "c_explain",
      description:
        "Look up a specific C compiler error by its code (e.g. E-segfault, W-format).",
      inputSchema: Type.Object({
        error_code: Type.String({
          description:
            "The CFix error code, e.g. E-segfault, W-format, E-undefined-reference",
        }),
      }),
      async handler({ error_code }) {
        const error = findByCode(error_code);
        if (!error) {
          return `Unknown error code: \`${error_code}\`. Use the c_errors tool to see available codes.`;
        }
        const fakeResult: FixResult = {
          parsed: {
            file: "",
            line: 0,
            column: 0,
            severity: error.code.startsWith("W") ? "warning" : "error",
            message: error.title,
            rawLine: "",
          },
          matched: error,
        };
        return formatFixResult(fakeResult);
      },
    });

    api.registerTool({
      name: "c_errors",
      description:
        "List known C compiler errors, optionally filtered by category.",
      inputSchema: Type.Object({
        category: Type.Optional(
          Type.String({
            description:
              "Filter by category: pointer, memory, type, syntax, preprocessor, linker, array, undefined-behavior, declaration, misc",
          }),
        ),
      }),
      async handler({ category }) {
        if (category) {
          const errors = findByCategory(category as ErrorCategory);
          if (errors.length === 0) {
            return `No errors found for category: ${category}. Available categories: ${listCategories().join(", ")}`;
          }
          return formatErrorList(errors);
        }
        return formatErrorList(C_ERRORS);
      },
    });

    api.registerHook("after_tool_call", async (event) => {
      const output =
        typeof event.result === "string" ? event.result : JSON.stringify(event.result);

      const cErrorPatterns = [
        /:\d+:\d+:\s+(error|warning):/,
        /undefined reference to/,
        /[Ss]egmentation fault/,
      ];

      const hasCError = cErrorPatterns.some((p) => p.test(output));
      if (!hasCError) return;

      const results = diagnose(output);
      if (results.length === 0) return;

      return {
        annotation: formatMultipleResults(results),
      };
    });
  },
});
