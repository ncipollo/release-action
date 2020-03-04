"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
class GithubArtifactUploader {
    constructor(releases, replacesExistingArtifacts) {
        this.replacesExistingArtifacts = true;
        this.releases = releases;
        this.replacesExistingArtifacts = replacesExistingArtifacts;
    }
    async uploadArtifact(artifact, uploadUrl, retry = 3) {
        try {
            core.debug(`Uploading artifact ${artifact.name}...`);
            await this.releases.uploadArtifact(uploadUrl, artifact.contentLength, artifact.contentType, artifact.readFile(), artifact.name);
        }
        catch (error) {
            if (error.status >= 500 && retry > 0) {
                core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}. Retrying...`);
                await this.uploadArtifact(artifact, uploadUrl, retry - 1);
            }
            else {
                core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}.`);
            }
        }
    }
    async uploadArtifacts(artifacts, releaseId, uploadUrl) {
        if (this.replacesExistingArtifacts) {
            await this.deleteUpdatedArtifacts(artifacts, releaseId);
        }
        for (const artifact of artifacts) {
            await this.uploadArtifact(artifact, uploadUrl);
        }
    }
    async deleteUpdatedArtifacts(artifacts, releaseId) {
        const response = await this.releases.listArtifactsForRelease(releaseId);
        const releaseAssets = response.data;
        const assetByName = {};
        releaseAssets.forEach(asset => {
            assetByName[asset.name] = asset;
        });
        for (const artifact of artifacts) {
            const asset = assetByName[artifact.name];
            if (asset) {
                core.debug(`Deleting exist artifact ${artifact.name}...`);
                await this.releases.deleteArtifact(asset.id);
            }
        }
    }
}
exports.GithubArtifactUploader = GithubArtifactUploader;
