import * as core from '@actions/core';
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
            try {
                await this.releases.uploadArtifact(uploadUrl,
                    artifact.contentLength,
                    artifact.contentType,
                    artifact.readFile(),
                    artifact.name)
            } catch(error) {
                const message = `Failed to upload artifact ${artifact.name}. Does it already exist?`
                core.warning(message)
            }
        });
    }
}