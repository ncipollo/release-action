import * as core from '@actions/core';
import {Context} from "@actions/github/lib/context";
import {readFileSync} from 'fs';
import {ArtifactGlobber} from './ArtifactGlobber';
import {Artifact} from './Artifact';

export interface Inputs {
    readonly allowUpdates: boolean
    readonly artifactErrorsFailBuild: boolean
    readonly artifacts: Artifact[]
    readonly commit: string
    readonly createdReleaseBody?: string
    readonly createdReleaseName?: string
    readonly discussionCategory?: string
    readonly draft: boolean
    readonly owner: string
    readonly createdPrerelease: boolean
    readonly removeArtifacts: boolean
    readonly replacesArtifacts: boolean
    readonly repo: string
    readonly tag: string
    readonly token: string
    readonly updatedReleaseBody?: string
    readonly updatedReleaseName?: string
    readonly updatedPrerelease?: boolean
}

export class CoreInputs implements Inputs {
    private artifactGlobber: ArtifactGlobber
    private context: Context

    constructor(artifactGlobber: ArtifactGlobber, context: Context) {
        this.artifactGlobber = artifactGlobber
        this.context = context
    }

    get allowUpdates(): boolean {
        const allow = core.getInput('allowUpdates')
        return allow == 'true'
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
                .globArtifactString(artifacts, contentType, this.artifactErrorsFailBuild)
        }
        return []
    }

    get artifactErrorsFailBuild(): boolean {
        const allow = core.getInput('artifactErrorsFailBuild')
        return allow == 'true'
    }

    get createdReleaseBody(): string | undefined {
        if (CoreInputs.omitBody) return undefined
        return this.body
    }

    private static get omitBody(): boolean {
        return core.getInput('omitBody') == 'true'
    }

    private get body(): string | undefined {
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

    get createdReleaseName(): string | undefined {
        if (CoreInputs.omitName) return undefined
        return this.name
    }

    get discussionCategory(): string | undefined {
        const category = core.getInput('discussionCategory')
        if (category) {
            return category
        }
        return undefined
    }

    private static get omitName(): boolean {
        return core.getInput('omitName') == 'true'
    }

    private get name(): string | undefined {
        const name = core.getInput('name')
        if (name) {
            return name
        }

        return this.tag
    }

    get draft(): boolean {
        const draft = core.getInput('draft')
        return draft == 'true'
    }

    get owner(): string {
        let owner = core.getInput('owner')
        if (owner) {
            return owner
        }
        return this.context.repo.owner
    }

    get createdPrerelease(): boolean {
        const preRelease = core.getInput('prerelease')
        return preRelease == 'true'
    }

    private static get omitPrereleaseDuringUpdate(): boolean {
        return core.getInput('omitPrereleaseDuringUpdate') == 'true'
    }

    get updatedPrerelease(): boolean | undefined {
        if (CoreInputs.omitPrereleaseDuringUpdate) return undefined
        return this.createdPrerelease
    }
    get removeArtifacts(): boolean {
        const removes = core.getInput('removeArtifacts')
        return removes == 'true'
    }
    get replacesArtifacts(): boolean {
        const replaces = core.getInput('replacesArtifacts')
        return replaces == 'true'
    }

    get repo(): string {
        let repo = core.getInput('repo')
        if (repo) {
            return repo
        }
        return this.context.repo.repo
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
        return core.getInput('token', {required: true})
    }

    get updatedReleaseBody(): string | undefined {
        if (CoreInputs.omitBody || CoreInputs.omitBodyDuringUpdate) return undefined
        return this.body
    }

    private static get omitBodyDuringUpdate(): boolean {
        return core.getInput('omitBodyDuringUpdate') == 'true'
    }

    get updatedReleaseName(): string | undefined {
        if (CoreInputs.omitName || CoreInputs.omitNameDuringUpdate) return undefined
        return this.name
    }

    private static get omitNameDuringUpdate(): boolean {
        return core.getInput('omitNameDuringUpdate') == 'true'
    }

    stringFromFile(path: string): string {
        return readFileSync(path, 'utf-8')
    }
}
