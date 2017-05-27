# DTS-Builder
[![Modern NodeJS](https://img.shields.io/badge/Node-4%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-2.2-blue.svg)](https://www.typescriptlang.org/)
[![Modern JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](http://www.ecma-international.org/ecma-262/6.0/)
[![MIT License](https://img.shields.io/badge/license-MIT-007EC7.svg)](/LICENSE)

## Synopsis

<!--At the top of the file there should be a short introduction and/ or overview that explains **what** the project is. This description should match descriptions added for package managers (Gemspec, package.json, etc.)-->
Assembles a singe library definition file by concatenating and cleaning up generated .d.ts files.

Returns a promise with the names of bundles that have been exported.

## Code Example

<!--Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.-->
```javascript
const path = require('path');
const dtsBuilder = require('dts-builder');

const projectRoot = path.resolve(__dirname, '../..');

dtsBuilder.generateBundles([
  {
    name: 'myLib',
    sourceDir: `${projectRoot}/ts-built/`,
    destDir: `${projectRoot}/dist`,
    externals: [
      `${projectRoot}/src/ext/external-lib.d.ts`,
      `${projectRoot}/src/lib/types.d.ts`
    ]
  }
]);
```

Running this script will read all TS declaration files from `sourceDir` (`${sourceDir}/**/*.d.ts`), concatenate them and clean up the result. It will then be wrapped with a `name` module declaration (`declare module ${name} { ... }`).
The result will be saved as `${name}.d.ts` in `destDir`.

Additionally, if `externals` array is provided, all the files that are referenced by it will be prepended to the top of the resulting library file as `/// <reference path="${basename(externals[i])}" />` and these files will be copied to `destDir` alongside the library file.


## Motivation

<!--A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.-->
A project that I am involved in has a large library that is being build using concatenation of ES5 files into a single .js package. The team moved to ES6 with modules, and I wanted to take it one notch further, and convert the 12k lines of code to TypeScript, for all the benefits.

However, I didn't find a good way to generate a single definition file that will act as a library. I started by playing with the generated d.ts files for each transpiled file to see how this can be achieved, and I created this simple script to remove and modify the result so it will be parsed well by `tsc` and will allow importing of the namespace.

## Installation

<!--Provide code examples and explanations of how to get the project.-->
```
npm install --save-dev dts-builder
```

## API Reference

<!--Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.-->
```typescript
module dtsBuilder {
    function generateBundles(bundles: Array<Bundle>): Promise<Array<string>>;

    interface Bundle {
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
}
```

## Tests

<!--Describe and show how to run the tests with code examples.-->
Currently test is basic, checking for required module and builds the generate-self package under two names.

## Contributors

<!--Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.-->
Feel free to fork, improve and send PRs if it's generic in nature.

## License

[MIT][mit] © [Boris Aranovič][author]

[mit]:            https://opensource.org/licenses/MIT
[author]:         https://github.com/nomaed
[contributors]:   https://github.com/nomaed/fishcake/graphs/contributors
