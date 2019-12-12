import { Inputs } from "./Inputs";
import { Releases } from "./Releases";
import { ArtifactUploader } from "./ArtifactUploader";
import { ErrorMessage } from "./ErrorMessage";
import { Response, ReposCreateReleaseResponse } from "@octokit/rest";

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
        const uploadUrl = await this.createOrUpdateRelease()

        const artifacts = this.inputs.artifacts
        if (artifacts.length > 0) {
            await this.uploader.uploadArtifacts(artifacts, uploadUrl)
        }
    }

    private async createOrUpdateRelease(): Promise<string> {
        try {
            return await this.createRelease()
        } catch (error) {
            if (this.releaseAlreadyExisted(error) && this.inputs.allowUpdates) {
                return this.updateRelease()
            } else {
                throw error
            }
        }
    }

    private async createRelease(): Promise<string> {
        const response = await this.releases.create(
            this.inputs.tag,
            this.inputs.body,
            this.inputs.commit,
            this.inputs.draft,
            this.inputs.name
        )

        return response.data.upload_url
    }

    private releaseAlreadyExisted(error: any): boolean {
        const errorMessage = new ErrorMessage(error)
        return errorMessage.hasErrorWithCode('already_exists')
    }

    private async updateRelease(): Promise<string> {
        const getResponse = await this.releases.getByTag(this.inputs.tag)
        const id = getResponse.data.id

        const response = await this.releases.update(
            id,
            this.inputs.tag,
            this.inputs.body,
            this.inputs.commit,
            this.inputs.draft,
            this.inputs.name
        )

        return response.data.upload_url
    }
}