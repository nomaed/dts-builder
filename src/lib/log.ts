import { DTSBuilderOptions } from "../index";

/**
 * Logging helper
 */
export function log(message: any, ...args: any[]) {
  if (!DTSBuilderOptions.verbose) return;
  console.log(message, ...args);
}
