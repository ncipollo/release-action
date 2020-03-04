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

    async uploadArtifact(artifact: Artifact, uploadUrl: string, retry = 3) {
        try {
            core.debug(`Uploading artifact ${artifact.name}...`)
            await this.releases.uploadArtifact(uploadUrl,
                artifact.contentLength,
                artifact.contentType,
                artifact.readFile(),
                artifact.name)
        } catch (error) {
            if (error.status >= 500 && retry > 0) {
                core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}. Retrying...`)
                await this.uploadArtifact(artifact, uploadUrl, retry - 1)
            } else {
                core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}.`)
            }
        }
    }

    async uploadArtifacts(artifacts: Artifact[],
        releaseId: number,
        uploadUrl: string): Promise<void> {
        if (this.replacesExistingArtifacts) {
            await this.deleteUpdatedArtifacts(artifacts, releaseId)
        }
        for (const artifact of artifacts) {
            await this.uploadArtifact(artifact, uploadUrl)
        }
    }

    async deleteUpdatedArtifacts(artifacts: Artifact[], releaseId: number): Promise<void> {
        const response =  await this.releases.listArtifactsForRelease(releaseId)
        const releaseAssets = response.data
        const assetByName: Record<string, ReposListAssetsForReleaseResponseItem> = {}
        releaseAssets.forEach(asset => {
            assetByName[asset.name] = asset
        });
        for (const artifact of artifacts) {
            const asset = assetByName[artifact.name]
            if (asset) {
                core.debug(`Deleting exist artifact ${artifact.name}...`)
                await this.releases.deleteArtifact(asset.id)
            }
        }
    }
}