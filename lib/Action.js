"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const ErrorMessage_1 = require("./ErrorMessage");
class Action {
    constructor(inputs, releases, uploader) {
        this.inputs = inputs;
        this.releases = releases;
        this.uploader = uploader;
    }
    async perform() {
        const releaseResponse = await this.createOrUpdateRelease();
        const releaseId = releaseResponse.id;
        const uploadUrl = releaseResponse.upload_url;
        const artifacts = this.inputs.artifacts;
        if (artifacts.length > 0) {
            await this.uploader.uploadArtifacts(artifacts, releaseId, uploadUrl);
        }
    }
    async createOrUpdateRelease() {
        if (this.inputs.allowUpdates) {
            try {
                const getResponse = await this.releases.getByTag(this.inputs.tag);
                return await this.updateRelease(getResponse.data.id);
            }
            catch (error) {
                if (Action.noPublishedRelease(error)) {
                    return await this.updateDraftOrCreateRelease();
                }
                else {
                    throw error;
                }
            }
        }
        else {
            return await this.createRelease();
        }
    }
    async updateRelease(id) {
        const response = await this.releases.update(id, this.inputs.tag, this.inputs.updatedReleaseBody, this.inputs.commit, this.inputs.draft, this.inputs.updatedReleaseName, this.inputs.prerelease);
        return response.data;
    }
    static noPublishedRelease(error) {
        const errorMessage = new ErrorMessage_1.ErrorMessage(error);
        return errorMessage.status == 404;
    }
    async updateDraftOrCreateRelease() {
        const draftReleaseId = await this.findMatchingDraftReleaseId();
        if (draftReleaseId) {
            return await this.updateRelease(draftReleaseId);
        }
        else {
            return await this.createRelease();
        }
    }
    async findMatchingDraftReleaseId() {
        const tag = this.inputs.tag;
        const response = await this.releases.listReleases();
        const releases = response.data;
        const draftRelease = releases.find(release => release.draft && release.tag_name == tag);
        return draftRelease === null || draftRelease === void 0 ? void 0 : draftRelease.id;
    }
    async createRelease() {
        const response = await this.releases.create(this.inputs.tag, this.inputs.createdReleaseBody, this.inputs.commit, this.inputs.draft, this.inputs.createdReleaseName, this.inputs.prerelease);
        return response.data;
    }
}
exports.Action = Action;
