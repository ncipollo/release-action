import * as core from "@actions/core"
import type { ActionSkipper } from "./ActionSkipper"
import type { ArtifactDestroyer } from "./ArtifactDestroyer"
import type { ArtifactUploader } from "./ArtifactUploader"
import { GithubError } from "./GithubError"
import type { Inputs } from "./Inputs"
import type { Outputs } from "./Outputs"
import { ReleaseValidator } from "./ReleaseValidator"
import type {
    CreateOrUpdateReleaseResponse,
    CreateReleaseResponse,
    ReleaseByTagResponse,
    Releases,
    UpdateReleaseResponse,
} from "./Releases"

export class Action {
    private inputs: Inputs
    private outputs: Outputs
    private releases: Releases
    private uploader: ArtifactUploader
    private artifactDestroyer: ArtifactDestroyer
    private skipper: ActionSkipper

    private releaseValidator: ReleaseValidator

    constructor(
        inputs: Inputs,
        outputs: Outputs,
        releases: Releases,
        uploader: ArtifactUploader,
        artifactDestroyer: ArtifactDestroyer,
        skipper: ActionSkipper
    ) {
        this.inputs = inputs
        this.outputs = outputs
        this.releases = releases
        this.uploader = uploader
        this.artifactDestroyer = artifactDestroyer
        this.skipper = skipper
        this.releaseValidator = new ReleaseValidator(inputs.updateOnlyUnreleased)
    }

    async perform() {
        if (await this.skipper.shouldSkip()) {
            core.notice("Skipping action, release already exists and skipIfReleaseExists is enabled.")
            return
        }

        await this.createOrUpdateRelease()
    }

    private async createOrUpdateRelease() {
        if (this.inputs.allowUpdates) {
            let getResponse: ReleaseByTagResponse
            try {
                getResponse = await this.releases.getByTag(this.inputs.tag)
            } catch (error: any) {
                await this.checkForMissingReleaseError(error)
                return
            }

            // Fail if this isn't an unreleased release & updateOnlyUnreleased is enabled.
            this.releaseValidator.validateReleaseUpdate(getResponse.data)

            await this.updateRelease(getResponse.data.id)
        } else {
            await this.createRelease()
        }
    }

    private async checkForMissingReleaseError(error: Error): Promise<void> {
        if (Action.noPublishedRelease(error)) {
            await this.updateDraftOrCreateRelease()
        } else {
            throw error
        }
    }

    private static noPublishedRelease(error: any): boolean {
        const githubError = new GithubError(error)
        return githubError.status == 404
    }

    private async updateDraftOrCreateRelease(): Promise<void> {
        const draftReleaseId = await this.findMatchingDraftReleaseId()
        if (draftReleaseId) {
            await this.updateRelease(draftReleaseId)
        } else {
            await this.createRelease()
        }
    }

    private async findMatchingDraftReleaseId(): Promise<number | undefined> {
        const tag = this.inputs.tag
        const response = await this.releases.listReleases()
        const releases = response.data
        if (!releases) {
            throw new Error(`No releases found. Response: ${JSON.stringify(response)}`)
        }

        const draftRelease = releases.find((release) => release.draft && release.tag_name == tag)

        return draftRelease?.id
    }

    private async updateRelease(id: number) {
        const releaseBody = await this.combineBodyWithReleaseNotes(this.inputs.updatedReleaseBody, true)

        const releaseResponse = await this.releases.update(
            id,
            this.inputs.tag,
            releaseBody,
            this.inputs.commit,
            this.inputs.discussionCategory,
            this.inputs.updatedDraft,
            this.inputs.makeLatest,
            this.inputs.updatedReleaseName,
            this.inputs.updatedPrerelease
        )

        await this.processReleaseArtifactsAndOutputs(releaseResponse, false)
    }

    private async createRelease() {
        const releaseBody = await this.combineBodyWithReleaseNotes(this.inputs.createdReleaseBody, false)

        // If immutableCreate is enabled we need to start with a draft release
        const draft = this.inputs.createdDraft || this.inputs.immutableCreate

        const releaseResponse = await this.releases.create(
            this.inputs.tag,
            releaseBody,
            this.inputs.commit,
            this.inputs.discussionCategory,
            draft,
            this.inputs.makeLatest,
            this.inputs.createdReleaseName,
            this.inputs.createdPrerelease
        )

        await this.processReleaseArtifactsAndOutputs(releaseResponse, true)
    }

    private async processReleaseArtifactsAndOutputs(releaseResponse: CreateOrUpdateReleaseResponse, wasCreated: boolean) {
        const releaseData = releaseResponse.data
        const releaseId = releaseData.id
        const uploadUrl = releaseData.upload_url

        if (this.inputs.removeArtifacts) {
            await this.artifactDestroyer.destroyArtifacts(releaseId)
        }

        const artifacts = this.inputs.artifacts
        let assetUrls: Record<string, string> = {}
        if (artifacts.length > 0) {
            assetUrls = await this.uploader.uploadArtifacts(artifacts, releaseId, uploadUrl)
        }

        if (wasCreated) {
            const immutableRelease = await this.publishImmutableRelease(releaseId)
            if (immutableRelease) {
                this.setOutputs(immutableRelease.data, assetUrls)
                return
            }
        }

        this.setOutputs(releaseData, assetUrls)
    }

    private async publishImmutableRelease(releaseId: number): Promise<CreateOrUpdateReleaseResponse | undefined> {
        // Check if immutableCreate is on and createdDraft is off
        if (!this.inputs.immutableCreate || this.inputs.createdDraft) {
            return undefined
        }

        return await this.releases.update(
            releaseId,
            this.inputs.tag,
            undefined, // body is omitted
            undefined, // commit is omitted
            this.inputs.discussionCategory,
            false, // We want to publish the release, set draft to false
            this.inputs.makeLatest,
            this.inputs.createdReleaseName,
            this.inputs.createdPrerelease
        )
    }

    private async combineBodyWithReleaseNotes(body: string | undefined, isUpdate: boolean): Promise<string | undefined> {
        // Determine if we should generate release notes based on operation type
        const shouldGenerateReleaseNotes = isUpdate 
            ? this.inputs.generateReleaseNotes && !this.inputs.omitBodyDuringUpdate
            : this.inputs.generateReleaseNotes

        if (!shouldGenerateReleaseNotes) {
            return body
        }

        const response = await this.releases.generateReleaseNotes(this.inputs.tag, this.inputs.generateReleaseNotesPreviousTag)
        const releaseNotes = response.data.body

        if (!body || body.trim() === "") {
            return releaseNotes
        }

        return `${body}\n${releaseNotes}`
    }

    private setOutputs(releaseData: any, assetUrls: Record<string, string>): void {
        this.outputs.applyReleaseData(releaseData)
        this.outputs.applyAssetUrls(assetUrls)
    }
}
