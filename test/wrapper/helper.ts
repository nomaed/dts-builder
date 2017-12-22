export namespace Wrapper {
    /** test that import word is okay */
    export function helper() {
        console.log("stuff and things");
    }

    function privateStuff() {
        // noop
    }
}

/**
 * Single property class with one property called import and that's it
 */
export class TestClassFoo {
    /** this property import is an import of import */
    public import: string = "import";
}