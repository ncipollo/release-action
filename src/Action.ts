import { Inputs } from "./Inputs";
import { Releases } from "./Releases";
import { ArtifactUploader } from "./ArtifactUploader";

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
        const createResult = await this.releases.create(
            this.inputs.tag,
            this.inputs.body,
            this.inputs.commit,
            this.inputs.draft,
            this.inputs.name
        )

        const artifacts = this.inputs.artifacts
        if (artifacts.length > 0) {
            await this.uploader.uploadArtifacts(
                artifacts,
                createResult.data.upload_url
            )
        }
    }
}