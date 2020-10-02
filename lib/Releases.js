"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GithubReleases {
    constructor(context, git) {
        this.context = context;
        this.git = git;
    }
    async create(tag, body, commitHash, draft, name, prerelease) {
        // noinspection TypeScriptValidateJSTypes
        return this.git.repos.createRelease({
            body: body,
            name: name,
            draft: draft,
            owner: this.context.repo.owner,
            prerelease: prerelease,
            repo: this.context.repo.repo,
            target_commitish: commitHash,
            tag_name: tag
        });
    }
    async deleteArtifact(assetId) {
        return this.git.repos.deleteReleaseAsset({
            asset_id: assetId,
            owner: this.context.repo.owner,
            repo: this.context.repo.repo
        });
    }
    async listArtifactsForRelease(releaseId) {
        return this.git.repos.listReleaseAssets({
            owner: this.context.repo.owner,
            release_id: releaseId,
            repo: this.context.repo.repo
        });
    }
    async listReleases() {
        return this.git.repos.listReleases({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo
        });
    }
    async getByTag(tag) {
        return this.git.repos.getReleaseByTag({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            tag: tag
        });
    }
    async update(id, tag, body, commitHash, draft, name, prerelease) {
        // noinspection TypeScriptValidateJSTypes
        return this.git.repos.updateRelease({
            release_id: id,
            body: body,
            name: name,
            draft: draft,
            owner: this.context.repo.owner,
            prerelease: prerelease,
            repo: this.context.repo.repo,
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
            owner: this.context.repo.owner,
            release_id: releaseId,
            repo: this.context.repo.repo
        });
    }
}
exports.GithubReleases = GithubReleases;
