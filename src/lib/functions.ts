import * as path from "path";
import * as fs from "fs";

import { Bundle } from "../types";
import { log } from "./log";
import { copyFile } from "./copy-file";
import * as patterns from "./regexp-patterns";

/**
 * @param {string} txtBuffer
 * @returns {string}
 */
export function optimizeImports(txtBuffer: string): string {
  // remove imports
  let result = txtBuffer.replace(patterns.externalModule, "");

  // get unique internal imports
  const matches = result.match(patterns.internalModule);
  const internalImports = matches ? getUnique(matches.map(imp => imp.toString().trim())) : [];

  // remove internal imports
  result = result.replace(patterns.internalModule, "");

  const remaining = result.match(/\bimport\b/);
  if (remaining && remaining.length) {
    console.error("Could not deal with the following:", JSON.stringify(remaining, null, 2));
  }

  // add internals
  result = sortInternals(internalImports).join("\n") + "\n" + result;
  result = removeReferences(result);
  result = removeDefaults(result);

  // remove export * from ...
  result = result.replace(patterns.externalReExports, "");

  // remove export declarations
  result = result.replace(patterns.exportDeclarations, "");

  return result;
}

/**
 * @param {string} text
 * @param {Bundle} bundle
 * @returns {string}
 */
export function moduleWrap(text: string, bundle: Bundle): string {
  log(" * Converting to module...");
  const camelName = toCamel(bundle.name);
  let lines = text
    .split("\n")
    .map(line => "  " + line
      .replace(/\bexport\s+declare\s+/, "export ")
      .replace(/\bdeclare\s+(class|function|const|var|let)\s+/, "$1 ")
    );
  lines.unshift(`
declare module '${camelName}' {
  export = ${camelName};
}

declare namespace ${camelName} {`);
  lines.push("}");
  // add alias
  if (bundle.alias) {
    lines.unshift(`import ${bundle.alias} = ${camelName};`);
  }
  return lines.join("\n");
}

/**
 * Remove empty lines, when 2 or more in a sequence
 * @param {string} text
 * @returns {string}
 */
export function cleanEmptyLines(text: string): string {
  let prevEmpty = false;
  return text.split("\n").filter(line => {
    const isEmpty = !line.trim().length;
    const keep = !isEmpty || !prevEmpty;
    prevEmpty = isEmpty;
    return keep;
  }).join("\n");
}

/**
 * @param {Bundle} bundle
 * @returns {string}
 */
export function addExternalRefs(bundle: Bundle) {
  if (!bundle || !bundle.externals) return "";
  const res = bundle.externals.map(ref => {
    const fileName = path.basename(ref);
    copyFile(ref, pathAppend(bundle.destDir, fileName), (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
      // TODO: localize references of the copied file, or update path
      log("+++ Copied external reference: %s", path.basename(res!));
    });
    log(" * Referencing external: %s", fileName);
    return `/// <reference path="${fileName}" />`;
  });
  return res.join("\n");
}

export function writeResult(bundle: Bundle, buffer: string) {
  const destFile = pathAppend(bundle.destDir, `${toKebab(bundle.name)}.d.ts`);
  log(" +-> Saving %s...", destFile);
  fs.writeFile(destFile, buffer, (err: NodeJS.ErrnoException) => {
    if (err) {
      throw new Error(err.message);
    }
    log('! "%s" bundle is ready', bundle.name);
  });
}


/*******************************************
 *** Internal
 *******************************************/


function toKebab(name: string): string {
  if (!name) return "";
  return name.split(/\W+/).map(part => part.toLowerCase()).join("-");
}

function toCamel(name: string): string {
  if (!name) return "";
  let parts = name.split(/\W+/).map(part => part.toLowerCase());
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substr(1);
  }
  return parts.join("");
}

/**
 * @param {string} src
 * @param {string} dst
 * @returns {string}
 */
function pathAppend(src: string, dst: string): string {
  src = src.trim().replace(/\/+$/, "");
  dst = dst.trim().replace(/^\/+/, "");
  return [src, dst].join("/");
}


/**
 * Returns unique array elements
 * @param {Array} arr
 * @returns {Array}
 */
function getUnique<T>(arr: Array<T>): Array<T> {
  let res: Array<T> = [];
  arr.forEach(item => {
    if (res.indexOf(item) === -1) res.push(item);
  });
  return res;
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
function sortInternals(arr: Array<string>): Array<string> {
  return arr
    .map(line => line.match(patterns.internalModuleParts))
    .sort(sortMatches)
    .map(obj => obj && `import ${obj[1]} = ${obj[2]};` || "");
}

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {number}
 * @private
 */
function sortMatches(a: Array<string>, b: Array<string>): number {
  const impA = a[2].toLowerCase();
  const impB = b[2].toLowerCase();
  if (impA < impB) return -1;
  if (impA > impB) return +1;
  return 0;
}

/**
 * @param {string} text
 * @returns {string}
 */
function removeReferences(text: string): string {
  return text.replace(patterns.reference, "");
}



/**
 * @param {string} text
 * @returns {string}
 */
function removeDefaults(text: string): string {
  return text
    .replace(patterns.defaultExport, "")
    .replace(patterns.defaultsFromNs, "");
}

