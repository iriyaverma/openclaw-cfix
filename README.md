# CFix — OpenClaw C/GCC/Clang Error Plugin

Created by **Riya Verma**.

CFix is an OpenClaw plugin that diagnoses and explains C compiler errors and warnings from GCC and Clang. It provides plain-English explanations, concrete fixes, and example code for 25+ common C programming mistakes.

## Installation

```bash
cd your-openclaw-project
npm install openclaw-cfix
```

Register the plugin in your OpenClaw configuration and you're ready to go.

## What It Does

CFix recognizes errors across 10 categories:

| Category | Description |
|---|---|
| **pointer** | Null dereference, incompatible pointer types, dangling pointers, void pointer arithmetic |
| **memory** | Segfaults, use-after-free, double free, memory leaks |
| **type** | Format string mismatches, implicit conversions, return type mismatches, signed/unsigned comparison |
| **syntax** | Missing semicolons, expected expression, missing return, too few/many arguments |
| **preprocessor** | Include file not found, macro expansion errors |
| **linker** | Undefined reference, multiple definition |
| **array** | Buffer overflow, array index out of bounds |
| **undefined-behavior** | Uninitialized variables |
| **declaration** | Implicit function declaration, undeclared identifier, conflicting types, redefinition |
| **misc** | Unused variables and other warnings |

## Agent Tools

CFix registers three tools that AI agents can use:

### `c_fix` — Diagnose Compiler Output

Paste raw GCC/Clang output and get explanations and fixes for every error and warning.

**Example input:**
```
main.c:10:5: error: undeclared identifier 'count'
main.c:15:1: warning: implicit declaration of function 'helper'
```

**Result:** Formatted markdown with explanations, fix suggestions, and code examples for each issue.

### `c_explain` — Look Up a Specific Error

Look up a specific error by its CFix code.

**Example:**
```
c_explain E-segfault
```

**Result:** Detailed explanation, fixes, and before/after code examples.

### `c_errors` — List Errors by Category

List all known errors, optionally filtered by category.

**Example:**
```
c_errors memory
```

**Result:** A table of all memory-related errors with their codes and difficulty levels.

## Auto-Detection

CFix registers an `after_tool_call` hook that automatically detects C compiler errors in tool output. When GCC/Clang errors, linker errors, or segfaults are detected, CFix annotates the result with explanations and fixes — no manual invocation needed.

## CLI Commands

CFix adds the `cfix` subcommand with three sub-commands:

```bash
# List all known errors (or filter by category)
openclaw cfix errors
openclaw cfix errors memory

# Look up a specific error code
openclaw cfix lookup E-segfault

# List all error categories
openclaw cfix categories
```

## Testing

```bash
npm install
npx vitest run
```

Tests cover:
- **Error database** — completeness, field validation, no duplicates
- **Parser** — GCC/Clang output parsing, linker errors, segfaults
- **Formatter** — markdown output for matched/fallback results, lists, multi-results

## License

MIT
