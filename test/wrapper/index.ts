/**
 * used to test files that already have a namespace syntax
 */

import * as hlp from "./helper";

export namespace Wrapper {
    export function myWrapperFunction(a: number): string {
        hlp.Wrapper.helper();
        return String(a);
    }

    export class WrapperFoo {
        constructor() {
        }

        public toString() {
            console.log("Foo!");
        }

        private toBar() {
            console.log("Bar :(");
        }
    }

    export const SOME_VALUE = 42;

    export interface IFooBar {
        num: number;
        str: string;
        cls: WrapperFoo;
        self: IFooBar;
    }

    function privateStuff() {
        // noop
    }
}