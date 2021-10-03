import {Inputs} from "./Inputs";
import {
    CreateOrUpdateReleaseResponse,
    CreateReleaseResponse,
    ReleaseByTagResponse,
    Releases,
    UpdateReleaseResponse
} from "./Releases";
import {ArtifactUploader} from "./ArtifactUploader";
import {GithubError} from "./GithubError";
import {Outputs} from "./Outputs";
import {ArtifactDestroyer} from "./ArtifactDestroyer";

export class Action {
    private inputs: Inputs
    private outputs: Outputs
    private releases: Releases
    private artifactDestroyer: ArtifactDestroyer
    private uploader: ArtifactUploader

    constructor(inputs: Inputs,
                outputs: Outputs,
                releases: Releases,
                uploader: ArtifactUploader,
                artifactDestroyer: ArtifactDestroyer) {
        this.inputs = inputs
        this.outputs = outputs
        this.releases = releases
        this.uploader = uploader
        this.artifactDestroyer = artifactDestroyer
    }

    async perform() {
        const releaseResponse = await this.createOrUpdateRelease();
        const releaseData = releaseResponse.data
        const releaseId = releaseData.id
        const uploadUrl = releaseData.upload_url
        
        if (this.inputs.removeArtifacts) {
            await this.artifactDestroyer.destroyArtifacts(releaseId)
        }
        
        const artifacts = this.inputs.artifacts
        if (artifacts.length > 0) {
            await this.uploader.uploadArtifacts(artifacts, releaseId, uploadUrl)
        }

        this.outputs.applyReleaseData(releaseData)
    }

    private async createOrUpdateRelease(): Promise<CreateOrUpdateReleaseResponse> {
        if (this.inputs.allowUpdates) {
            let getResponse: ReleaseByTagResponse
            try {
                getResponse = await this.releases.getByTag(this.inputs.tag)
            } catch (error: any) {
                return await this.checkForMissingReleaseError(error)
            }

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
        return await this.releases.update(
            id,
            this.inputs.tag,
            this.inputs.updatedReleaseBody,
            this.inputs.commit,
            this.inputs.discussionCategory,
            this.inputs.draft,
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
        const draftRelease = releases.find(release => release.draft && release.tag_name == tag)

        return draftRelease?.id
    }

    private async createRelease(): Promise<CreateReleaseResponse> {
        return await this.releases.create(
            this.inputs.tag,
            this.inputs.createdReleaseBody,
            this.inputs.commit,
            this.inputs.discussionCategory,
            this.inputs.draft,
            this.inputs.createdReleaseName,
            this.inputs.createdPrerelease
        )
    }
}
