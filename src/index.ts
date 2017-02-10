import * as fs from "fs";
import * as mkdirp from "mkdirp";

import { Bundle } from "./types";
import { findFiles } from "./lib/find-files";
import { log } from "./lib/log";
import { addExternalRefs, cleanEmptyLines, moduleWrap, optimizeImports, writeResult } from "./lib/functions";

/** Global options */
export const DTSBuilderOptions = {
  /** Set to `false` to remove all debug output except for Exceptions */
  verbose: true
};

/**
 * Receives a list of Bundles and generates the d.ts file according
 * to bundle configuration.
 * @param {Array<Bundle>} bundles
 */
export function generateBundles(bundles: Array<Bundle>): void {
  if (!Array.isArray(bundles)) {
    throw new TypeError(`Invalid bundles argument, must be an array. Got ${typeof bundles}.`);
  }

  const len = bundles.length;
  log("Generating definition for %d bundle(s)...", len);
  if (!len) {
    log("Nothing to do... Bye.");
    return;
  }

  for (const bundle of bundles) {
    log("> Generating bundle %s", bundle.name);

    log(" + Gathering definitions from %s/**/*.d.ts", bundle.sourceDir);
    const dtsFiles = findFiles(bundle.sourceDir);
    if (!dtsFiles.length) {
      log("No files were found in bundle %s.", bundle.name);
      continue;
    }
    log("   + Found %d definition files.", dtsFiles.length);

    log(" + Concatenating definitions to a single file");
    const binBuffers = dtsFiles.map(file => fs.readFileSync(file));
    let txtBuffer = binBuffers.map(buffer => buffer.toString()).join("\n");
    log("   + Done, total size: %d characters", txtBuffer.length);

    log(" + Optimizing imports...");
    txtBuffer = optimizeImports(txtBuffer);
    log(" + Wrapping with module...");
    txtBuffer = moduleWrap(txtBuffer, bundle);
    log(" + Removing empty lines...");
    txtBuffer = cleanEmptyLines(txtBuffer);

    if (bundle.externals) {
      log(" + Adding external definition files...");
      txtBuffer = addExternalRefs(bundle) + "\n" + txtBuffer;
    }

    if (!fs.existsSync(bundle.destDir)) {
      mkdirp(bundle.destDir, (err) => {
        if (err) throw new Error(err);
        else {
          log(" + Created destrination directory: %s", bundle.destDir);
          writeResult(bundle, txtBuffer);
        }
      });
    }
    else {
      writeResult(bundle, txtBuffer);
    }
  }
}
