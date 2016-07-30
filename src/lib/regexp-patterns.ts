export const reference = /^\/\/\/\s+<\s*reference\s+path\s*=\s*["'].+["']\s*\/>\s*$/gm;
export const externalModule = /^(\s*import\s+[\*\{}\w\s\n, ]*['"].+['"];)$/gm;
export const externalReExports = /^\s*export\s+[\*\{}\w\s\n, ]+\s+from\s['"].+['"];$/gm;
export const internalModule = /^(\s*import\s+.*;)$/gm;
export const internalModuleParts = /^import\s+([a-zA-Z]+)\s*=\s*([a-zA-Z\.0-9_]+);$/;
export const defaultExport = /^\s*declare\s+var\s+_default\s*:\s*string\s*;\s*export\s+default\s+_default\s*;\s*$/gm;
export const defaultsFromNs = /^\s*export\s+(default\s+)?[a-zA-Z][a-zA-Z0-9_]*\s*;\s*$/gm;
