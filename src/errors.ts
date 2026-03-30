import type { CError, ErrorCategory } from "./types.js";

export const C_ERRORS: CError[] = [
  {
    code: "E-segfault",
    title: "Segmentation Fault",
    category: "memory",
    pattern: /[Ss]egmentation fault|SIGSEGV/,
    explanation:
      "The program tried to access memory it doesn't own. This usually happens when dereferencing a NULL or dangling pointer, accessing an array out of bounds, or writing to read-only memory.",
    fixes: [
      "Check all pointers for NULL before dereferencing",
      "Ensure arrays are accessed within their bounds",
      "Use tools like Valgrind or AddressSanitizer to locate the exact access",
      "Verify dynamically allocated memory is not freed prematurely",
    ],
    example: {
      bad: 'int *p = NULL;\n*p = 42; // segfault',
      good: 'int *p = malloc(sizeof(int));\nif (p != NULL) {\n    *p = 42;\n}',
    },
    docUrl: "https://man7.org/linux/man-pages/man7/signal.7.html",
    difficulty: "hard",
  },
  {
    code: "E-use-after-free",
    title: "Use After Free",
    category: "memory",
    pattern: /use after free|heap-use-after-free/,
    explanation:
      "Memory was accessed after it had been freed. This leads to undefined behavior and potential security vulnerabilities.",
    fixes: [
      "Set pointers to NULL immediately after freeing them",
      "Restructure ownership so freed memory is never referenced again",
      "Use AddressSanitizer (-fsanitize=address) to detect at runtime",
    ],
    example: {
      bad: 'int *p = malloc(sizeof(int));\nfree(p);\n*p = 10; // use after free',
      good: 'int *p = malloc(sizeof(int));\nfree(p);\np = NULL;',
    },
    docUrl: "https://cwe.mitre.org/data/definitions/416.html",
    difficulty: "hard",
  },
  {
    code: "E-null-dereference",
    title: "Null Pointer Dereference",
    category: "pointer",
    pattern: /null pointer dereference|NULL pointer|dereference of null/i,
    explanation:
      "A NULL pointer was dereferenced. This typically causes a segmentation fault at runtime.",
    fixes: [
      "Always check malloc/calloc return values before use",
      "Add NULL guards before dereferencing pointers from functions",
      "Use static analysis tools to catch potential NULL paths",
    ],
    example: {
      bad: 'int *p = NULL;\nprintf("%d", *p);',
      good: 'int *p = NULL;\nif (p != NULL) {\n    printf("%d", *p);\n}',
    },
    docUrl: "https://cwe.mitre.org/data/definitions/476.html",
    difficulty: "medium",
  },
  {
    code: "W-implicit-function-declaration",
    title: "Implicit Function Declaration",
    category: "declaration",
    pattern: /implicit declaration of function|implicitly declaring library function/,
    explanation:
      "A function is being called without a prior declaration or #include of its header. In C99 and later this is invalid; in older standards the compiler assumed it returned int.",
    fixes: [
      "Add the correct #include for the function's header",
      "Add a forward declaration of the function before the call",
      "If it is your own function, make sure the header is included",
    ],
    example: {
      bad: 'int main() {\n    printf("hello");\n    return 0;\n}',
      good: '#include <stdio.h>\nint main() {\n    printf("hello");\n    return 0;\n}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "W-incompatible-pointer-types",
    title: "Incompatible Pointer Types",
    category: "pointer",
    pattern: /incompatible pointer type/,
    explanation:
      "A pointer of one type was used where a different pointer type was expected. This can cause undefined behavior if the pointed-to types differ in size or alignment.",
    fixes: [
      "Cast the pointer explicitly if the conversion is intentional",
      "Change the variable or parameter type to match",
      "Use void* as an intermediary only when truly generic",
    ],
    example: {
      bad: 'int x = 5;\nchar *p = &x; // incompatible pointer types',
      good: 'int x = 5;\nint *p = &x;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "medium",
  },
  {
    code: "W-format",
    title: "Format String Mismatch",
    category: "type",
    pattern: /format ('|'|%)[^'']*(('|')| ).*expects|format specifies type/,
    explanation:
      "The format specifier in printf/scanf does not match the type of the argument supplied. This leads to undefined behavior.",
    fixes: [
      'Use %d for int, %f for double, %s for char*, %ld for long, %zu for size_t',
      "Match every format specifier to its corresponding argument type",
      "Enable -Wformat to catch these at compile time",
    ],
    example: {
      bad: 'int x = 42;\nprintf("%s", x); // %s expects char*',
      good: 'int x = 42;\nprintf("%d", x);',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Wformat",
    difficulty: "easy",
  },
  {
    code: "E-missing-semicolon",
    title: "Missing Semicolon",
    category: "syntax",
    pattern: /expected ('|'|';'|;).*before|missing.*semicolon|expected ';'/,
    explanation:
      "A semicolon is missing at the end of a statement. The compiler may report the error on the line after the missing semicolon.",
    fixes: [
      "Add the missing semicolon at the end of the previous statement",
      "Check the line reported AND the line above it",
      "Look for missing semicolons after struct/enum/union definitions",
    ],
    example: {
      bad: 'int x = 5\nint y = 10;',
      good: 'int x = 5;\nint y = 10;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "E-undeclared-identifier",
    title: "Undeclared Identifier",
    category: "declaration",
    pattern: /undeclared identifier|undeclared.*first use|use of undeclared/,
    explanation:
      "A variable or function name was used but has not been declared in the current scope.",
    fixes: [
      "Declare the variable before using it",
      "Check for typos in the identifier name",
      "#include the header that declares the identifier",
      "Ensure the declaration is in scope (not inside a different block)",
    ],
    example: {
      bad: 'int main() {\n    x = 5;\n    return 0;\n}',
      good: 'int main() {\n    int x = 5;\n    return 0;\n}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "E-multiple-definition",
    title: "Multiple Definition",
    category: "linker",
    pattern: /multiple definition of/,
    explanation:
      "The same symbol was defined in more than one translation unit. The linker cannot decide which one to use.",
    fixes: [
      "Move the definition to a single .c file and declare it extern in the header",
      "Use static for file-local definitions",
      "Use include guards or #pragma once to prevent double-inclusion of headers with definitions",
    ],
    example: {
      bad: '// a.c\nint counter = 0;\n// b.c\nint counter = 0;',
      good: '// shared.h\nextern int counter;\n// a.c\nint counter = 0;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "medium",
  },
  {
    code: "E-undefined-reference",
    title: "Undefined Reference",
    category: "linker",
    pattern: /undefined reference to|ld: symbol\(s\) not found/,
    explanation:
      "The linker found a call to a function or a use of a variable that was declared but never defined in any linked object file or library.",
    fixes: [
      "Make sure the .c file containing the definition is compiled and linked",
      "Add the required library with -l (e.g. -lm for math functions)",
      "Check for typos in the function/variable name",
      "Ensure the function signature matches between declaration and definition",
    ],
    example: {
      bad: '// main.c\nvoid helper(void);\nint main() { helper(); }  // never defined',
      good: '// helper.c\nvoid helper(void) { /* ... */ }\n// compile: gcc main.c helper.c -o prog',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Link-Options.html",
    difficulty: "medium",
  },
  {
    code: "W-buffer-overflow",
    title: "Buffer Overflow",
    category: "array",
    pattern: /buffer overflow|array subscript.*above array bounds|array index.*past the end/,
    explanation:
      "An array or buffer was accessed beyond its allocated size. This is a common source of security vulnerabilities.",
    fixes: [
      "Use bounded functions like strncpy, snprintf instead of strcpy, sprintf",
      "Always validate array indices before access",
      "Use sizeof to compute buffer sizes rather than hardcoding values",
      "Compile with -fsanitize=address to catch overflows at runtime",
    ],
    example: {
      bad: 'char buf[8];\nstrcpy(buf, "a very long string that overflows");',
      good: 'char buf[8];\nstrncpy(buf, "hello", sizeof(buf) - 1);\nbuf[sizeof(buf) - 1] = \'\\0\';',
    },
    docUrl: "https://cwe.mitre.org/data/definitions/120.html",
    difficulty: "hard",
  },
  {
    code: "W-dangling-pointer",
    title: "Dangling Pointer",
    category: "pointer",
    pattern: /dangling pointer|use of pointer to expired|storing the address of local variable/,
    explanation:
      "A pointer refers to memory that is no longer valid, such as a local variable whose scope has ended or memory that has been freed.",
    fixes: [
      "Never return pointers to local (stack) variables",
      "Allocate memory on the heap if it must outlive the function",
      "Set pointers to NULL after freeing",
    ],
    example: {
      bad: 'int* bad(void) {\n    int x = 42;\n    return &x; // dangling\n}',
      good: 'int* good(void) {\n    int *x = malloc(sizeof(int));\n    *x = 42;\n    return x;\n}',
    },
    docUrl: "https://cwe.mitre.org/data/definitions/562.html",
    difficulty: "hard",
  },
  {
    code: "W-uninitialized",
    title: "Uninitialized Variable",
    category: "undefined-behavior",
    pattern: /uninitialized|is used uninitialized|may be used uninitialized/,
    explanation:
      "A variable is read before any value has been assigned to it. Its value is indeterminate and using it is undefined behavior.",
    fixes: [
      "Initialize variables at declaration (e.g. int x = 0;)",
      "Ensure all code paths assign before the first read",
      "Enable -Wuninitialized and -Wall to detect these at compile time",
    ],
    example: {
      bad: 'int x;\nprintf("%d", x); // undefined',
      good: 'int x = 0;\nprintf("%d", x);',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Wuninitialized",
    difficulty: "easy",
  },
  {
    code: "W-implicit-int-conversion",
    title: "Implicit Integer Conversion",
    category: "type",
    pattern: /implicit conversion loses integer precision|implicit conversion.*from.*to/,
    explanation:
      "A value is being implicitly converted to a smaller integer type, which may silently discard higher-order bits.",
    fixes: [
      "Use an explicit cast to show the conversion is intentional",
      "Change the destination type to match the source",
      "Verify the value range is safe before narrowing",
    ],
    example: {
      bad: 'long big = 100000;\nchar small = big; // truncation',
      good: 'long big = 100000;\nchar small = (char)(big & 0xFF);',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "medium",
  },
  {
    code: "W-missing-return",
    title: "Missing Return Statement",
    category: "syntax",
    pattern: /control reaches end of non-void function|non-void function does not return/,
    explanation:
      "A function declared to return a value does not have a return statement on every code path.",
    fixes: [
      "Add a return statement at the end of the function",
      "Ensure every branch (if/else/switch) returns a value",
      "If no return is intended, change the return type to void",
    ],
    example: {
      bad: 'int add(int a, int b) {\n    int c = a + b;\n    // missing return c;\n}',
      good: 'int add(int a, int b) {\n    int c = a + b;\n    return c;\n}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Wreturn-type",
    difficulty: "easy",
  },
  {
    code: "E-conflicting-types",
    title: "Conflicting Types",
    category: "declaration",
    pattern: /conflicting types for/,
    explanation:
      "The same function or variable has been declared with two different types. This often happens when a function is called before its prototype and the compiler infers a wrong type.",
    fixes: [
      "Add a proper function prototype before the first call",
      "Ensure the declaration in the header matches the definition",
      "Include the correct header file",
    ],
    example: {
      bad: 'void foo(int x);\nint foo(int x) { return x; } // conflict',
      good: 'int foo(int x);\nint foo(int x) { return x; }',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "medium",
  },
  {
    code: "E-too-few-arguments",
    title: "Too Few Arguments to Function",
    category: "syntax",
    pattern: /too few arguments to function/,
    explanation:
      "A function was called with fewer arguments than its declaration requires.",
    fixes: [
      "Supply all required arguments in the function call",
      "Check the function prototype for the expected parameter list",
      "If fewer arguments are intentional, update the function signature",
    ],
    example: {
      bad: 'int add(int a, int b) { return a + b; }\nint r = add(5); // missing second arg',
      good: 'int add(int a, int b) { return a + b; }\nint r = add(5, 3);',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "E-too-many-arguments",
    title: "Too Many Arguments to Function",
    category: "syntax",
    pattern: /too many arguments to function/,
    explanation:
      "A function was called with more arguments than its declaration accepts.",
    fixes: [
      "Remove the extra arguments from the call",
      "If more arguments are needed, update the function signature",
      "Check you are calling the correct function",
    ],
    example: {
      bad: 'int square(int x) { return x * x; }\nint r = square(5, 3); // extra arg',
      good: 'int square(int x) { return x * x; }\nint r = square(5);',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "E-struct-member-access",
    title: "Invalid Struct Member Access",
    category: "type",
    pattern: /has no member named|request for member.*in something not a structure/,
    explanation:
      "An attempt was made to access a member that does not exist on the struct or union, or to use '.' on a pointer (should be '->').",
    fixes: [
      "Check the struct definition for the correct member name",
      "Use -> instead of . when accessing members through a pointer",
      "Ensure the correct header defining the struct is included",
    ],
    example: {
      bad: 'struct Point { int x; int y; };\nstruct Point *p = ...;\nint a = p.x; // should use ->',
      good: 'struct Point { int x; int y; };\nstruct Point *p = ...;\nint a = p->x;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "E-include-error",
    title: "Include File Not Found",
    category: "preprocessor",
    pattern: /fatal error:.*No such file or directory|file not found.*include|cannot find include/i,
    explanation:
      "The preprocessor could not locate a #include'd header file on any of the search paths.",
    fixes: [
      "Verify the filename spelling and case",
      "Use -I to add the directory containing the header to the include path",
      "Install the missing library or development package",
      'Use angle brackets <> for system headers and quotes "" for project headers',
    ],
    example: {
      bad: '#include "myheder.h" // typo',
      good: '#include "myheader.h"',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Directory-Options.html",
    difficulty: "easy",
  },
  {
    code: "E-macro-error",
    title: "Macro Expansion Error",
    category: "preprocessor",
    pattern: /macro.*requires.*arguments|unterminated.*macro|macro.*redefined|expected.*macro/,
    explanation:
      "A preprocessor macro was used incorrectly — wrong number of arguments, unterminated, or redefined without #undef.",
    fixes: [
      "Pass the correct number of arguments to function-like macros",
      "Ensure macro definitions are properly terminated",
      "Use #undef before redefining an existing macro",
      "Wrap multi-statement macros in do { ... } while(0)",
    ],
    example: {
      bad: '#define MAX(a, b) ((a) > (b) ? (a) : (b))\nint x = MAX(1); // too few args',
      good: '#define MAX(a, b) ((a) > (b) ? (a) : (b))\nint x = MAX(1, 2);',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Preprocessor-Options.html",
    difficulty: "medium",
  },
  {
    code: "W-unused-variable",
    title: "Unused Variable",
    category: "misc",
    pattern: /unused variable/,
    explanation:
      "A variable was declared but never used in the function. This usually indicates dead code or a logic error.",
    fixes: [
      "Remove the variable if it is truly unnecessary",
      "Use (void)var; to explicitly mark it as intentionally unused",
      "Use __attribute__((unused)) on variables that are intentionally unused",
    ],
    example: {
      bad: 'void foo(void) {\n    int unused = 42;\n}',
      good: 'void foo(void) {\n    int used = 42;\n    printf("%d", used);\n}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Wunused-variable",
    difficulty: "easy",
  },
  {
    code: "W-sign-compare",
    title: "Signed/Unsigned Comparison",
    category: "type",
    pattern: /comparison between signed and unsigned|sign-compare/,
    explanation:
      "A signed integer is being compared with an unsigned integer. The signed value may be implicitly converted to unsigned, causing negative values to appear very large.",
    fixes: [
      "Cast one side to match the other explicitly",
      "Change the variable types so both sides match",
      "Use the same signedness for loop counters and bounds",
    ],
    example: {
      bad: 'int i = -1;\nunsigned int n = 5;\nif (i < n) {} // i wraps to large unsigned',
      good: 'int i = -1;\nint n = 5;\nif (i < n) {}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Wsign-compare",
    difficulty: "medium",
  },
  {
    code: "E-expected-expression",
    title: "Expected Expression",
    category: "syntax",
    pattern: /expected expression/,
    explanation:
      "The compiler expected an expression but found something else, such as an extra comma, missing operand, or misplaced keyword.",
    fixes: [
      "Check for extra or missing commas, parentheses, or braces",
      "Ensure the statement is syntactically complete",
      "Verify correct placement of keywords like return, if, while",
    ],
    example: {
      bad: 'int x = ;',
      good: 'int x = 0;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "W-pointer-arith",
    title: "Pointer Arithmetic on Void or Function Pointer",
    category: "pointer",
    pattern: /arithmetic on.*void.*pointer|pointer of type.*void.*used in arithmetic/,
    explanation:
      "Pointer arithmetic was attempted on a void* or function pointer, which has no defined element size. This is a GCC extension but invalid in standard C.",
    fixes: [
      "Cast the void pointer to a concrete type before doing arithmetic",
      "Use char* when doing byte-level arithmetic",
      "Avoid arithmetic on function pointers entirely",
    ],
    example: {
      bad: 'void *p = malloc(100);\np = p + 10; // void* arithmetic',
      good: 'void *p = malloc(100);\nchar *cp = (char *)p + 10;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Pointer-Arith.html",
    difficulty: "medium",
  },
  {
    code: "W-double-free",
    title: "Double Free",
    category: "memory",
    pattern: /double free|free\(\): invalid pointer|double-free/,
    explanation:
      "The same block of dynamically allocated memory was freed more than once. This corrupts the heap and leads to undefined behavior.",
    fixes: [
      "Set the pointer to NULL immediately after freeing",
      "Track ownership clearly — only one code path should free each allocation",
      "Use tools like Valgrind or ASan to detect double frees",
    ],
    example: {
      bad: 'int *p = malloc(sizeof(int));\nfree(p);\nfree(p); // double free',
      good: 'int *p = malloc(sizeof(int));\nfree(p);\np = NULL;',
    },
    docUrl: "https://cwe.mitre.org/data/definitions/415.html",
    difficulty: "hard",
  },
  {
    code: "W-return-type",
    title: "Return Type Mismatch",
    category: "type",
    pattern: /returning.*from a function with incompatible result type|return type.*mismatch/,
    explanation:
      "The value returned from a function does not match the declared return type.",
    fixes: [
      "Change the return statement to match the function's return type",
      "Update the function's return type to match what is actually returned",
      "Add an explicit cast if the conversion is intentional",
    ],
    example: {
      bad: 'int* foo(void) {\n    return 42; // returning int, not int*\n}',
      good: 'int foo(void) {\n    return 42;\n}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Wreturn-type",
    difficulty: "easy",
  },
  {
    code: "E-redefinition",
    title: "Redefinition of Symbol",
    category: "declaration",
    pattern: /redefinition of|redeclared as different kind/,
    explanation:
      "A variable, function, or type was defined more than once in the same scope.",
    fixes: [
      "Remove the duplicate definition",
      "Use include guards (#ifndef/#define/#endif) in headers",
      "Use extern declarations in headers instead of definitions",
    ],
    example: {
      bad: 'int x = 1;\nint x = 2; // redefinition',
      good: 'int x = 1;\nx = 2;',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    difficulty: "easy",
  },
  {
    code: "W-memory-leak",
    title: "Memory Leak",
    category: "memory",
    pattern: /memory leak|possibly lost|definitely lost|still reachable/,
    explanation:
      "Dynamically allocated memory was never freed, causing the program to consume increasing amounts of memory over time.",
    fixes: [
      "Ensure every malloc/calloc/realloc has a corresponding free",
      "Free memory in error-handling code paths as well",
      "Use Valgrind --leak-check=full to find all leak sources",
      "Consider using goto-based cleanup patterns in C",
    ],
    example: {
      bad: 'void leak(void) {\n    int *p = malloc(100 * sizeof(int));\n    // never freed\n}',
      good: 'void no_leak(void) {\n    int *p = malloc(100 * sizeof(int));\n    // ... use p ...\n    free(p);\n}',
    },
    docUrl: "https://valgrind.org/docs/manual/mc-manual.html",
    difficulty: "medium",
  },
  {
    code: "W-array-bounds",
    title: "Array Index Out of Bounds",
    category: "array",
    pattern: /array subscript is (above|below|outside)|array bounds/,
    explanation:
      "An array was accessed with an index outside its valid range. This is undefined behavior.",
    fixes: [
      "Ensure the index is between 0 and length-1",
      "Add bounds checks before array access",
      "Use sizeof(arr)/sizeof(arr[0]) to compute array lengths",
    ],
    example: {
      bad: 'int arr[5];\narr[10] = 42; // out of bounds',
      good: 'int arr[5];\nif (idx >= 0 && idx < 5) {\n    arr[idx] = 42;\n}',
    },
    docUrl: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html#index-Warray-bounds",
    difficulty: "medium",
  },
];

export function findByCode(code: string): CError | undefined {
  return C_ERRORS.find(
    (e) => e.code.toLowerCase() === code.toLowerCase(),
  );
}

export function findByPattern(message: string): CError | undefined {
  return C_ERRORS.find((e) => e.pattern.test(message));
}

export function findByCategory(category: ErrorCategory): CError[] {
  return C_ERRORS.filter((e) => e.category === category);
}

export function listCategories(): ErrorCategory[] {
  return [...new Set(C_ERRORS.map((e) => e.category))];
}
