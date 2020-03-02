import * as core from '@actions/core';
import { Artifact } from "./Artifact";
import { Releases } from "./Releases";
import { ReposListAssetsForReleaseResponseItem } from "@octokit/rest";
import { ErrorMessage } from './ErrorMessage';

export interface ArtifactUploader {
    uploadArtifacts(artifacts: Artifact[], releaseId: number, uploadUrl: string): Promise<void>
}

export class GithubArtifactUploader implements ArtifactUploader {
    private releases: Releases
    private replacesExistingArtifacts: boolean = true

    constructor(releases: Releases, replacesExistingArtifacts: boolean) {
        this.releases = releases
        this.replacesExistingArtifacts = replacesExistingArtifacts
    }

    async uploadArtifacts(artifacts: Artifact[],
        releaseId: number,
        uploadUrl: string): Promise<void> {
        if(this.replacesExistingArtifacts)  {
            await this.deleteUpdatedArtifacts(artifacts, releaseId)
        }

        for (const artifact of artifacts) {
            try {
                await this.releases.uploadArtifact(uploadUrl,
                    artifact.contentLength,
                    artifact.contentType,
                    artifact.readFile(),
                    artifact.name)
            } catch (error) {
                const message = `Failed to upload artifact ${artifact.name}. Does it already exist?`
                core.warning(message)
            }
        }
        return Promise.resolve()
    }

    async deleteUpdatedArtifacts(artifacts: Artifact[], releaseId: number) {
        const response = await this.releases.listArtifactsForRelease(releaseId)
        const releaseAssets = response.data
        const assetByName = new Map<string, ReposListAssetsForReleaseResponseItem>()
        releaseAssets.forEach(asset => {
            assetByName[asset.name] = asset
        });
        for (const artifact of artifacts) {
            const asset = assetByName[artifact.name]
            if (asset) {
                await this.releases.deleteArtifact(asset.id)
            }
        }
    }
}