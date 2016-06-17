declare module testBundle {
  import ErrnoException = NodeJS.ErrnoException;
  
  
  export * from './lib/dts-builder';
  
  /**
   * @link http://stackoverflow.com/a/14387791
   * @param {string} source filename
   * @param {string} target filename
   * @param {Function} cb
   */
  export function copyFile(source: string, target: string, cb: (err: ErrnoException, target: string) => any): void;
  
  export interface Bundle {
      /**
       * Bundle name. Used for d.ts filename and the wrapping namespace.
       */
      name: string;
      sourceDir: string;
      destDir: string;
      externals?: Array<string>;
  }
  export let DTSBuilderVerbose: boolean;
  /**
   * @param {Bundle[]} bundles
   */
  export function generateBundles(bundles: Array<Bundle>): void;
  /**
   * @param {string} src
   * @param {string} dst
   * @returns {string}
   */
  export function pathAppend(src: string, dst: string): string;
  
  export function findFiles(dir: string, match?: RegExp): Array<string>;
  
  export const reference: RegExp;
  export const externalModule: RegExp;
  export const externalReExports: RegExp;
  export const internalModule: RegExp;
  export const internalModuleParts: RegExp;
  export const defaultExport: RegExp;
  
}