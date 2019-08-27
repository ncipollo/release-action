import * as core from '@actions/core';
import { Context } from "@actions/github/lib/context";
import { readFileSync, statSync } from 'fs';

export interface Inputs {
    readonly artifact: string
    readonly artifactContentType: string
    readonly artifactContentLength: number
    readonly body: string
    readonly commit: string
    readonly draft: boolean
    readonly name: string
    readonly tag: string
    readonly token: string
}

export class CoreInputs implements Inputs {
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

    get body(): string {
        const body = core.getInput('body')
        if (body) {
            return body
        }

        const bodyFile = core.getInput('bodyFile')
        if (bodyFile) {
            return this.stringFromFile(bodyFile)
        }

        return ''
    }

    get commit(): string {
        return core.getInput('commit')
    }

    get draft(): boolean {
        const draft = core.getInput('draft')
        return draft == 'true'
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

    stringFromFile(path: string): string {
        return readFileSync(path, 'utf-8')
    }
}