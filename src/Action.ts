import { Inputs } from "./Inputs";
import { Releases } from "./Releases";
import { basename } from "path";

export class Action {
    private inputs: Inputs
    private releases: Releases

    constructor(inputs: Inputs, releases: Releases) {
        this.inputs = inputs
        this.releases = releases
    }

    async perform() {
        const createResult = await this.releases.create(
            this.inputs.tag,
            this.inputs.body,
            this.inputs.commit,
            this.inputs.draft,
            this.inputs.name
        )

        if (this.inputs.artifact) {
            await this.releases.uploadArtifact(
                createResult.data.assets_url,
                this.inputs.artifactContentLength,
                this.inputs.artifactContentType,
                this.inputs.artifact,
                basename(this.inputs.artifact)
            )
        }
    }
}