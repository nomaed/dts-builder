export interface Bundle {
  /**
   * Bundle name. Used for d.ts filename and the wrapping namespace.
   * @type {string}
   */
  name: string;

  /**
   * Location in which to search for *.d.ts files
   * @type {string}
   */
  sourceDir: string;

  /**
   * Location in which to save the output, under the name: `${name}.d.ts`
   * @type {string}
   */
  destDir: string;

  /**
   * List of external d.ts files that will be copied to the destination
   * directory, and will be referenced from withing the main d.ts file
   * @type {Array<string>}
   */
  externals?: Array<string>;

  /**
   * Wrap resulting definitions in a namespace. Set to false if files are already wrapped
   * by namespaces.
   * Default: true
   * @type {boolean}
   */
  wrap?: boolean;

  /**
   * If specified, library will exported as the given value, as an alias together
   * with the original name.
   * @type {string}
   */
  alias?: string;

}
