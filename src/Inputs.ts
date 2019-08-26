import * as core from '@actions/core';
import { Context } from "@actions/github/lib/context";
import { isObject } from 'util';
import { fstat, readFileSync } from 'fs';

export class Inputs {
    private context: Context

    constructor(context: Context) {
        this.context = context
    }

    get artifact(): string {
        return core.getInput('artifact')
    }

    get commit(): string {
        return core.getInput('commit')
    }

    get description(): string {
        const description = core.getInput('description')
        if(description) {
            return description
        }
        
        const descriptionFile = core.getInput('descriptionFile')
        if(descriptionFile) {
            return this.stringFromFile(descriptionFile)
        }

        return ''
    }

    get name(): string {
        const name = core.getInput('tag')
        if (name) {
            return name
        }

        return this.tag
    }

    get token(): string {
        return core.getInput('token', { required: true })
    }

    get tag(): string {
        const tag = core.getInput('tag')
        if (tag) {
            return tag;
        }

        const ref = this.context.ref
        const tagPath = "refs/tags/"
        if (ref && ref.startsWith(tagPath)) {
            return ref.substr(tagPath.length, ref.length)
        }

        throw Error("No tag found in ref or input!")
    }

    private stringFromFile(path: string): string {
        return readFileSync(path, 'utf-8')
    }
}