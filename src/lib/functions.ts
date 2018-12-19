import * as path from "path";
import * as fs from "fs";
import * as mkdirp from "mkdirp";

import { Bundle } from "../types";
import { log } from "./log";
import { copyFile } from "./copy-file";
import { findFiles } from "./find-files";
import * as patterns from "./regexp-patterns";

export function generateSingleBundle(bundle: Bundle): Promise<string> {
  return new Promise((resolve, reject) => {
    log("> Generating bundle %s", bundle.name);

    if (!bundle.sourceDir) {
      reject(`No sourceDir was specified for bundle ${bundle.name}`);
      return;
    }

    log(" + Gathering definitions from %s/**/*.d.ts", bundle.sourceDir);
    findFiles(bundle.sourceDir)
      .then(filesToString)
      .then(txtBuffer => {
        log("   + Total size: %d characters", txtBuffer.length);

        log(" + Optimizing imports...");
        txtBuffer = optimizeImports(txtBuffer);

        if (bundle.wrap === undefined || bundle.wrap === true) {
          log(" + Wrapping with module...");
          txtBuffer = moduleWrap(txtBuffer, bundle);
        }

        log(" + Removing empty lines...");
        txtBuffer = cleanEmptyLines(txtBuffer);

        if (bundle.externals) {
          log(" + Adding external definition files...");
          txtBuffer = addExternalRefs(bundle) + "\n" + txtBuffer;
        }

        if (!fs.existsSync(bundle.destDir)) {
          mkdirp(bundle.destDir, (err) => {
            if (err) {
              reject(`Unable to generate bundle ${bundle.name}: ${err}`);
            }
            else {
              log(" + Created destrination directory: %s", bundle.destDir);
              writeResult(bundle, txtBuffer)
                .then(() => resolve(bundle.name));
            }
          });
        }
        else {
          writeResult(bundle, txtBuffer)
            .then(() => resolve(bundle.name));
        }
      })
      .catch(reason => {
        reject(`Failed generating bundle "${bundle.name}": ${reason}`);
      });
  });
}

/*******************************************
 *** Internal
 *******************************************/

function filesToString(files: Array<string>): Promise<string> {
  if (!Array.isArray(files) || !files.length) {
    log("No definition files were found for bundle");
    return Promise.reject(`No defnition files`);
  }

  return new Promise((resolve, reject) => {
    log("   + Found %d definition files.", files.length);
    log(" + Concatenating definitions to a single file");
    resolve(files
      .map(file => fs.readFileSync(file))
      .map(buffer => buffer.toString())
      .join("\n")
    );
  });
}

function optimizeImports(txtBuffer: string): string {
  // remove imports
  let result = txtBuffer.replace(patterns.externalModule, "");

  // get unique internal imports
  const matches = result.match(patterns.internalModule);
  const internalImports = matches ? getUnique(matches.map(imp => imp.toString().trim())) : [];

  // remove internal imports
  result = result.replace(patterns.internalModule, "");

  // remove internal inline imports
  result = result.replace(patterns.internalInlineModule, "");

  const remaining = result.match(/\bimport\b/);
  if (remaining && remaining.length) {
    throw new Error(`optimizeImports() could not deal with the following: ${JSON.stringify(remaining, null, 2)}`);
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

function moduleWrap(text: string, bundle: Bundle): string {
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
 */
function cleanEmptyLines(text: string): string {
  let prevEmpty = false;
  return text.split("\n").filter(line => {
    const isEmpty = !line.trim().length;
    const keep = !isEmpty || !prevEmpty;
    prevEmpty = isEmpty;
    return keep;
  }).join("\n");
}

function addExternalRefs(bundle: Bundle) {
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

function writeResult(bundle: Bundle, buffer: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const destFile = pathAppend(bundle.destDir, `${toKebab(bundle.name)}.d.ts`);
    log(" +-> Saving %s...", destFile);
    fs.writeFile(destFile, buffer, (err: NodeJS.ErrnoException) => {
      if (err) {
        throw new Error(err.message);
      }
      log('! "%s" bundle is ready', bundle.name);
      resolve();
    });
  });
}

function toKebab(name: string): string {
  if (!name) return "";
  return name.split(/\W+/).map(part => part.toLowerCase()).join("-");
}

function toCamel(name: string): string {
  if (!name) return "";
  const parts = name.split(/\W+/);

  // if a single word, keep as is and don't camelize
  if (parts.length === 1) return name;

  // convert parts to camelCase
  parts[0] = parts[0].toLowerCase();
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substr(1).toLowerCase();
  }

  return parts.join("");
}

function pathAppend(src: string, dst: string): string {
  src = src.trim().replace(/\/+$/, "");
  dst = dst.trim().replace(/^\/+/, "");
  return [src, dst].join("/");
}

/**
 * Returns unique array elements
 */
function getUnique<T>(arr: Array<T>): Array<T> {
  let res: Array<T> = [];
  arr.forEach(item => {
    if (res.indexOf(item) === -1) res.push(item);
  });
  return res;
}

function sortInternals(arr: Array<string>): Array<string> {
  return arr
    .map(line => line.match(patterns.internalModuleParts))
    .sort(sortMatches)
    .map(obj => obj && `import ${obj[1]} = ${obj[2]};` || "");
}

function sortMatches(a: Array<string>, b: Array<string>): number {
  const impA = a[2].toLowerCase();
  const impB = b[2].toLowerCase();
  if (impA < impB) return -1;
  if (impA > impB) return +1;
  return 0;
}

function removeReferences(text: string): string {
  return text.replace(patterns.reference, "");
}

function removeDefaults(text: string): string {
  return text
    .replace(patterns.defaultExport, "")
    .replace(patterns.defaultsFromNs, "");
}

