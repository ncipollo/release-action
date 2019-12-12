import { Artifact } from "./Artifact";
import { Releases } from "./Releases";

export interface ArtifactUploader {
    uploadArtifacts(artifacts: Artifact[], uploadUrl: string): Promise<void>
}

export class GithubArtifactUploader implements ArtifactUploader {
    private releases: Releases

    constructor(releases: Releases) {
        this.releases = releases
    }

    async uploadArtifacts(artifacts: Artifact[], uploadUrl: string) {
        artifacts.forEach(async artifact => {
            await this.releases.uploadArtifact(uploadUrl,
                artifact.contentLength,
                artifact.contentType,
                artifact.readFile(),
                artifact.name)
        });
    }
}