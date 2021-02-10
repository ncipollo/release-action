"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubReleases = void 0;
class GithubReleases {
    constructor(inputs, git) {
        this.inputs = inputs;
        this.git = git;
    }
    async create(tag, body, commitHash, draft, name, prerelease) {
        // noinspection TypeScriptValidateJSTypes
        return this.git.repos.createRelease({
            body: body,
            name: name,
            draft: draft,
            owner: this.inputs.owner,
            prerelease: prerelease,
            repo: this.inputs.repo,
            target_commitish: commitHash,
            tag_name: tag
        });
    }
    async deleteArtifact(assetId) {
        return this.git.repos.deleteReleaseAsset({
            asset_id: assetId,
            owner: this.inputs.owner,
            repo: this.inputs.repo
        });
    }
    async getByTag(tag) {
        return this.git.repos.getReleaseByTag({
            owner: this.inputs.owner,
            repo: this.inputs.repo,
            tag: tag
        });
    }
    async listArtifactsForRelease(releaseId) {
        return this.git.repos.listReleaseAssets({
            owner: this.inputs.owner,
            release_id: releaseId,
            repo: this.inputs.repo
        });
    }
    async listReleases() {
        return this.git.repos.listReleases({
            owner: this.inputs.owner,
            repo: this.inputs.repo
        });
    }
    async update(id, tag, body, commitHash, draft, name, prerelease) {
        // noinspection TypeScriptValidateJSTypes
        return this.git.repos.updateRelease({
            release_id: id,
            body: body,
            name: name,
            draft: draft,
            owner: this.inputs.owner,
            prerelease: prerelease,
            repo: this.inputs.repo,
            target_commitish: commitHash,
            tag_name: tag
        });
    }
    async uploadArtifact(assetUrl, contentLength, contentType, file, name, releaseId) {
        return this.git.repos.uploadReleaseAsset({
            url: assetUrl,
            headers: {
                "content-length": contentLength,
                "content-type": contentType
            },
            data: file,
            name: name,
            owner: this.inputs.owner,
            release_id: releaseId,
            repo: this.inputs.repo
        });
    }
}
exports.GithubReleases = GithubReleases;
