import * as core from '@actions/core';
import { Context } from "@actions/github/lib/context";

export class Inputs {
    private context: Context

    constructor(context: Context) {
        this.context = context;
    }

    get token(): string {
        return core.getInput('token', {required: true});
    }

    get tag() : string {
        const tag = core.getInput('tag');
        if(tag != null) {
            return tag;
        }

        const ref = this.context.ref;
        const tagPath = "refs/tags/";
        if(ref.startsWith(tagPath)) {
            return ref.substr(0, tagPath.length);
        }

        throw Error("No tag found in ref or input!")
    }
}