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

        const releaseResponse = await this.createOrUpdateRelease()
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

        this.outputs.applyReleaseData(releaseData)
        this.outputs.applyAssetUrls(assetUrls)
    }

    private async createOrUpdateRelease(): Promise<CreateOrUpdateReleaseResponse> {
        if (this.inputs.allowUpdates) {
            let getResponse: ReleaseByTagResponse
            try {
                getResponse = await this.releases.getByTag(this.inputs.tag)
            } catch (error: any) {
                return await this.checkForMissingReleaseError(error)
            }

            // Fail if this isn't an unreleased release & updateOnlyUnreleased is enabled.
            this.releaseValidator.validateReleaseUpdate(getResponse.data)

            return await this.updateRelease(getResponse.data.id)
        } else {
            return await this.createRelease()
        }
    }

    private async checkForMissingReleaseError(error: Error): Promise<CreateOrUpdateReleaseResponse> {
        if (Action.noPublishedRelease(error)) {
            return await this.updateDraftOrCreateRelease()
        } else {
            throw error
        }
    }

    private async updateRelease(id: number): Promise<UpdateReleaseResponse> {
        let releaseBody = this.inputs.updatedReleaseBody

        if (this.inputs.generateReleaseNotes && !this.inputs.omitBodyDuringUpdate) {
            const response = await this.releases.generateReleaseNotes(this.inputs.tag)
            releaseBody = response.data.body
        }

        return await this.releases.update(
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
    }

    private static noPublishedRelease(error: any): boolean {
        const githubError = new GithubError(error)
        return githubError.status == 404
    }

    private async updateDraftOrCreateRelease(): Promise<CreateReleaseResponse | UpdateReleaseResponse> {
        const draftReleaseId = await this.findMatchingDraftReleaseId()
        if (draftReleaseId) {
            return await this.updateRelease(draftReleaseId)
        } else {
            return await this.createRelease()
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

    private async createRelease(): Promise<CreateReleaseResponse> {
        let releaseBody = this.inputs.createdReleaseBody

        if (this.inputs.generateReleaseNotes) {
            const response = await this.releases.generateReleaseNotes(this.inputs.tag)
            releaseBody = response.data.body
        }

        return await this.releases.create(
            this.inputs.tag,
            releaseBody,
            this.inputs.commit,
            this.inputs.discussionCategory,
            this.inputs.createdDraft,
            this.inputs.makeLatest,
            this.inputs.createdReleaseName,
            this.inputs.createdPrerelease
        )
    }
}
