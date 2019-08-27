"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class GithubReleases {
    constructor(context, git) {
        this.context = context;
        this.git = git;
    }
    create(tag, body, commitHash, draft, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.repos.createRelease({
                body: body,
                name: name,
                draft: draft,
                owner: this.context.repo.owner,
                repo: this.context.repo.repo,
                target_commitish: commitHash,
                tag_name: tag
            });
        });
    }
    uploadArtifact(assetUrl, contentLength, contentType, file, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.repos.uploadReleaseAsset({
                url: assetUrl,
                headers: {
                    "content-length": contentLength,
                    "content-type": contentType
                },
                file: file,
                name: name
            });
        });
    }
}
exports.GithubReleases = GithubReleases;
