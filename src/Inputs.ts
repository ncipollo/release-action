import * as core from '@actions/core';
import { Context } from "@actions/github/lib/context";
import { readFileSync, statSync } from 'fs';

export class Inputs {
    private context: Context

    constructor(context: Context) {
        this.context = context
    }

    get artifact(): string {
        return core.getInput('artifact')
    }

    get artifactContentType(): string {
        const type = core.getInput('artifactContentType')
        if(type) {
            return type;
        }

        return 'raw'
    }

    get artifactContentLength(): number {
        return statSync(this.artifact).size
    }

    get commit(): string {
        return core.getInput('commit')
    }

    get description(): string {
        const description = core.getInput('description')
        if (description) {
            return description
        }

        const descriptionFile = core.getInput('descriptionFile')
        if (descriptionFile) {
            return this.stringFromFile(descriptionFile)
        }

        return ''
    }

    get name(): string {
        const name = core.getInput('name')
        if (name) {
            return name
        }

        return this.tag
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

    get token(): string {
        return core.getInput('token', { required: true })
    }

    private stringFromFile(path: string): string {
        return readFileSync(path, 'utf-8')
    }
}