"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubReleases = void 0;
class GithubReleases {
    constructor(inputs, git) {
        this.inputs = inputs;
        this.git = git;
    }
    create(tag, body, commitHash, discussionCategory, draft, name, prerelease) {
        return __awaiter(this, void 0, void 0, function* () {
            // noinspection TypeScriptValidateJSTypes
            return this.git.rest.repos.createRelease({
                body: body,
                name: name,
                discussion_category_name: discussionCategory,
                draft: draft,
                owner: this.inputs.owner,
                prerelease: prerelease,
                repo: this.inputs.repo,
                target_commitish: commitHash,
                tag_name: tag
            });
        });
    }
    deleteArtifact(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.rest.repos.deleteReleaseAsset({
                asset_id: assetId,
                owner: this.inputs.owner,
                repo: this.inputs.repo
            });
        });
    }
    getByTag(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.rest.repos.getReleaseByTag({
                owner: this.inputs.owner,
                repo: this.inputs.repo,
                tag: tag
            });
        });
    }
    listArtifactsForRelease(releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.paginate(this.git.rest.repos.listReleaseAssets, {
                owner: this.inputs.owner,
                release_id: releaseId,
                repo: this.inputs.repo
            });
        });
    }
    listReleases() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.rest.repos.listReleases({
                owner: this.inputs.owner,
                repo: this.inputs.repo
            });
        });
    }
    update(id, tag, body, commitHash, discussionCategory, draft, name, prerelease) {
        return __awaiter(this, void 0, void 0, function* () {
            // noinspection TypeScriptValidateJSTypes
            return this.git.rest.repos.updateRelease({
                release_id: id,
                body: body,
                name: name,
                discussion_category_name: discussionCategory,
                draft: draft,
                owner: this.inputs.owner,
                prerelease: prerelease,
                repo: this.inputs.repo,
                target_commitish: commitHash,
                tag_name: tag
            });
        });
    }
    uploadArtifact(assetUrl, contentLength, contentType, file, name, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.rest.repos.uploadReleaseAsset({
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
        });
    }
}
exports.GithubReleases = GithubReleases;
