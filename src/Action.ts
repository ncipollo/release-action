import {Inputs} from "./Inputs";
import {CreateReleaseResponse, Releases, UpdateReleaseResponse} from "./Releases";
import {ArtifactUploader} from "./ArtifactUploader";
import {ErrorMessage} from "./ErrorMessage";

export class Action {
    private inputs: Inputs
    private releases: Releases
    private uploader: ArtifactUploader

    constructor(inputs: Inputs, releases: Releases, uploader: ArtifactUploader) {
        this.inputs = inputs
        this.releases = releases
        this.uploader = uploader
    }

    async perform() {
        const releaseResponse = await this.createOrUpdateRelease();
        const releaseId = releaseResponse.data.id
        const uploadUrl = releaseResponse.data.upload_url

        const artifacts = this.inputs.artifacts
        if (artifacts.length > 0) {
            await this.uploader.uploadArtifacts(artifacts, releaseId, uploadUrl)
        }
    }

    private async createOrUpdateRelease(): Promise<CreateReleaseResponse | UpdateReleaseResponse> {
        if (this.inputs.allowUpdates) {
            try {
                const getResponse = await this.releases.getByTag(this.inputs.tag)
                return await this.updateRelease(getResponse.data.id)
            } catch (error) {
                if (Action.noPublishedRelease(error)) {
                    return await this.updateDraftOrCreateRelease()
                } else {
                    throw error
                }
            }
        } else {
            return await this.createRelease()
        }
    }

    private async updateRelease(id: number): Promise<UpdateReleaseResponse> {
        return await this.releases.update(
            id,
            this.inputs.tag,
            this.inputs.updatedReleaseBody,
            this.inputs.commit,
            this.inputs.draft,
            this.inputs.updatedReleaseName,
            this.inputs.prerelease
        )
    }

    private static noPublishedRelease(error: any): boolean {
        const errorMessage = new ErrorMessage(error)
        return errorMessage.status == 404
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
            this.inputs.draft,
            this.inputs.createdReleaseName,
            this.inputs.prerelease
        )
    }
}
