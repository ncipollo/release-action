import { Inputs } from "./Inputs";
import { Releases } from "./Releases";
import { ArtifactUploader } from "./ArtifactUploader";
import { ErrorMessage } from "./ErrorMessage";

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
        if(this.inputs.allowUpdates) {
            try {
                const getResponse = await this.releases.getByTag(this.inputs.tag)
                return this.updateRelease(getResponse.data.id)
            } catch (error) {
                if (this.noRelease(error)) {
                    return await this.createRelease()
                } else {
                    throw error
                }
            }
        } else {
            return await this.createRelease()
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

    private noRelease(error:any): boolean {
        const errorMessage = new ErrorMessage(error)
        return errorMessage.hasErrorWithCode('missing')
    }

    private async updateRelease(id: number): Promise<string> {
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