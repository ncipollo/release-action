import * as core from '@actions/core';
import { Context } from "@actions/github/lib/context";
import { readFileSync } from 'fs';
import { ArtifactGlobber } from './ArtifactGlobber';
import { Artifact } from './Artifact';

export interface Inputs {
    readonly artifacts: Artifact[]
    readonly body: string
    readonly commit: string
    readonly draft: boolean
    readonly name: string
    readonly tag: string
    readonly token: string
}

export class CoreInputs implements Inputs {
    private artifactGlobber: ArtifactGlobber
    private context: Context

    constructor(artifactGlobber: ArtifactGlobber, context: Context) {
        this.artifactGlobber = artifactGlobber
        this.context = context
    }

    get artifacts(): Artifact[] {
        let artifacts = core.getInput('artifacts')
        if (!artifacts) {
            artifacts = core.getInput('artifact')
        }
        if (artifacts) {
            let contentType = core.getInput('artifactContentType')
            if (!contentType) {
                contentType = 'raw'
            }
            return this.artifactGlobber
                .globArtifactString(artifacts, contentType)
        }
        return []
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