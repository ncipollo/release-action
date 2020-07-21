"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubArtifactUploader = void 0;
const core = __importStar(require("@actions/core"));
class GithubArtifactUploader {
    constructor(releases, replacesExistingArtifacts = true) {
        this.releases = releases;
        this.replacesExistingArtifacts = replacesExistingArtifacts;
    }
    async uploadArtifacts(artifacts, releaseId, uploadUrl) {
        if (this.replacesExistingArtifacts) {
            await this.deleteUpdatedArtifacts(artifacts, releaseId);
        }
        for (const artifact of artifacts) {
            await this.uploadArtifact(artifact, releaseId, uploadUrl);
        }
    }
    async uploadArtifact(artifact, releaseId, uploadUrl, retry = 3) {
        try {
            core.debug(`Uploading artifact ${artifact.name}...`);
            await this.releases.uploadArtifact(uploadUrl, artifact.contentLength, artifact.contentType, artifact.readFile(), artifact.name, releaseId);
        }
        catch (error) {
            if (error.status >= 500 && retry > 0) {
                core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}. Retrying...`);
                await this.uploadArtifact(artifact, releaseId, uploadUrl, retry - 1);
            }
            else {
                core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}.`);
            }
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
                core.debug(`Deleting existing artifact ${artifact.name}...`);
                await this.releases.deleteArtifact(asset.id);
            }
        }
    }
}
exports.GithubArtifactUploader = GithubArtifactUploader;
