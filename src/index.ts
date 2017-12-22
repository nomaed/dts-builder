import * as fs from "fs";

import { Bundle } from "./types";
import { log } from "./lib/log";
import { generateSingleBundle } from "./lib/functions";

/** Global options */
export const DTSBuilderOptions = {
  /** Set to `false` to remove all debug output except for Exceptions */
  verbose: true
};

/**
 * Receives a list of Bundles and generates the d.ts file according
 * to bundle configuration.
 */
export function generateBundles(bundles: Array<Bundle>): Promise<Array<string>> {
  const finishedBundles: Array<string> = [];

  if (!Array.isArray(bundles)) {
    return Promise.reject(`Invalid bundles argument, must be an array. Got ${typeof bundles}.`);
  }

  const len = bundles.length;
  log("Generating definition for %d bundle(s)...", len);
  if (!len) {
    log("Nothing to do... Bye.");
    return Promise.resolve([]);
  }

  return Promise.all(bundles.map(bundle => generateSingleBundle(bundle)));
}
