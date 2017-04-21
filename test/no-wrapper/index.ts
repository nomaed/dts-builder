/**
 * used to test files that do not have a namespace syntax
 */

import { helper } from "./helper";

export function myWrapperFunction(a: number): string {
    helper();
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
