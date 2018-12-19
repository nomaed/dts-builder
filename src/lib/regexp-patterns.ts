// example: ///<reference path="myfile.d.ts" />
export const reference = /^\/\/\/\s+<\s*reference\s+path\s*=\s*["'].+["']\s*\/>\s*$/gm;

// example: import *, { foo } from "./bar";
export const externalModule = /^(\s*import\s+[\*\{}\w\s\n, ]*['"].+['"];)$/gm;

// example: export * from "./lib/index";
export const externalReExports = /^\s*export\s+[\*\{}\w\s\n, ]+\s+from\s['"].+['"];$/gm;

// Catching all: import ...;
export const internalModule = /^(\s*import\s+.*;)$/gm;

// example: import("./bar").Foo;
export const internalInlineModule = /\b(import\(.*)\./gm;

// example: import foo = barbar.thisIsFoo;
export const internalModuleParts = /^import\s+([a-zA-Z]+)\s*=\s*([a-zA-Z\.0-9_]+);$/;

// example: declare var _default: string; export defaukt _default;
export const defaultExport = /^\s*declare\s+var\s+_default\s*:\s*string\s*;\s*export\s+default\s+_default\s*;\s*$/gm;

// example: export default ...;
export const defaultsFromNs = /^\s*export\s+(default\s+)?[a-zA-Z][a-zA-Z0-9_]*\s*;\s*$/gm;

// example: export { foo, bar };
export const exportDeclarations = /^\s*export\s+{[^}]*};$/gm;
