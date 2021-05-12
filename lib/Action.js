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
exports.Action = void 0;
const GithubError_1 = require("./GithubError");
class Action {
    constructor(inputs, outputs, releases, uploader) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.releases = releases;
        this.uploader = uploader;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseResponse = yield this.createOrUpdateRelease();
            const releaseData = releaseResponse.data;
            const releaseId = releaseData.id;
            const uploadUrl = releaseData.upload_url;
            const artifacts = this.inputs.artifacts;
            if (artifacts.length > 0) {
                yield this.uploader.uploadArtifacts(artifacts, releaseId, uploadUrl);
            }
            this.outputs.applyReleaseData(releaseData);
        });
    }
    createOrUpdateRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inputs.allowUpdates) {
                let getResponse;
                try {
                    getResponse = yield this.releases.getByTag(this.inputs.tag);
                }
                catch (error) {
                    return yield this.checkForMissingReleaseError(error);
                }
                return yield this.updateRelease(getResponse.data.id);
            }
            else {
                return yield this.createRelease();
            }
        });
    }
    checkForMissingReleaseError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Action.noPublishedRelease(error)) {
                return yield this.updateDraftOrCreateRelease();
            }
            else {
                throw error;
            }
        });
    }
    updateRelease(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.releases.update(id, this.inputs.tag, this.inputs.updatedReleaseBody, this.inputs.commit, this.inputs.discussionCategory, this.inputs.draft, this.inputs.updatedReleaseName, this.inputs.prerelease);
        });
    }
    static noPublishedRelease(error) {
        const githubError = new GithubError_1.GithubError(error);
        return githubError.status == 404;
    }
    updateDraftOrCreateRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            const draftReleaseId = yield this.findMatchingDraftReleaseId();
            if (draftReleaseId) {
                return yield this.updateRelease(draftReleaseId);
            }
            else {
                return yield this.createRelease();
            }
        });
    }
    findMatchingDraftReleaseId() {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = this.inputs.tag;
            const response = yield this.releases.listReleases();
            const releases = response.data;
            const draftRelease = releases.find(release => release.draft && release.tag_name == tag);
            return draftRelease === null || draftRelease === void 0 ? void 0 : draftRelease.id;
        });
    }
    createRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.releases.create(this.inputs.tag, this.inputs.createdReleaseBody, this.inputs.commit, this.inputs.discussionCategory, this.inputs.draft, this.inputs.createdReleaseName, this.inputs.prerelease);
        });
    }
}
exports.Action = Action;
