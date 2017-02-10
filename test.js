const path = require("path");
const dtsBuilder = require(".");

console.log("Testing dts-builder...");

Promise.all([
    checkModule(),
    checkGenerateBundles(),
    checkGenerateBundlesFn(),
    checkOptions(),
    checkOptionsVerbose(),
    generateBundle(),
])
    .then(() => {
        console.log("All tests passed!");
    })
    .catch((reason) => {
        console.error(reason);
        process.exitCode = 1;
    });

function checkModule() {
    return new Promise((resolve, reject) => {
        if (!dtsBuilder) {
            reject("Unable to load dts-builder module");
        }
        else {
            console.log(" + Loaded dtsBuilder module");
            resolve();
        }
    });
}

function checkGenerateBundles() {
    return new Promise((resolve, reject) => {
        if (!dtsBuilder.generateBundles) {
            reject("No generate-bundles functionality detected");
        }
        else {
            console.log(" + generateBundles detected");
            resolve();
        }
    });
}

function checkGenerateBundlesFn() {
    return new Promise((resolve, reject) => {
        if (typeof dtsBuilder.generateBundles !== "function") {
            reject("Invalid generate-bundles detected");
        }
        else {
            console.log(" + generateBundles: function");
            resolve();
        }
    });
}

function checkOptions() {
    return new Promise((resolve, reject) => {
        if (!dtsBuilder.DTSBuilderOptions) {
            reject("No DTSBuilderOptions object detected");
        }
        else {
            console.log(" + DTSBuilderOptions detected");
            resolve();
        }
    });
}

function checkOptionsVerbose() {
    return new Promise((resolve, reject) => {
        if (typeof dtsBuilder.DTSBuilderOptions.verbose !== "boolean") {
            reject("Invalid DTSBuilderOptions.verbose detected");
        }
        else {
            console.log(" + DTSBuilderOptions.verbose: boolean");
            resolve();
        }
    });
}

function generateBundle() {
    const bundles = [{
        name: "dts-builder",
        alias: "dts",
        sourceDir: path.resolve(__dirname, "dist"),
        destDir: path.resolve(__dirname, "./test-out")
    },
    {
        name: "dts-builder-2",
        alias: "dts2",
        sourceDir: path.resolve(__dirname, "dist"),
        destDir: path.resolve(__dirname, "./test-out")
    },
    // {
    //     name: "failed",
    //     sourceDir: '.'
    // }
    ];
    return new Promise((resolve, reject) => {
        dtsBuilder.DTSBuilderOptions.verbose = false;
        dtsBuilder.generateBundles(bundles)
            .then((result) => {
                console.log(" + Generated test bundles: " + result.join(", "));
                resolve();
            })
            .catch((err) => {
                if (err instanceof Error) reject(`Exception: ${err.stack}`);
                else reject(err);
            });
    })
}