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
const ErrorMessage_1 = require("./ErrorMessage");
class Action {
    constructor(inputs, releases, uploader) {
        this.inputs = inputs;
        this.releases = releases;
        this.uploader = uploader;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadUrl = yield this.createOrUpdateRelease();
            const artifacts = this.inputs.artifacts;
            if (artifacts.length > 0) {
                yield this.uploader.uploadArtifacts(artifacts, uploadUrl);
            }
        });
    }
    createOrUpdateRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inputs.allowUpdates) {
                try {
                    const getResponse = yield this.releases.getByTag(this.inputs.tag);
                    return yield this.updateRelease(getResponse.data.id);
                }
                catch (error) {
                    if (this.noPublishedRelease(error)) {
                        return yield this.updateDraftOrCreateRelease();
                    }
                    else {
                        throw error;
                    }
                }
            }
            else {
                return yield this.createRelease();
            }
        });
    }
    updateRelease(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.releases.update(id, this.inputs.tag, this.inputs.body, this.inputs.commit, this.inputs.draft, this.inputs.name, this.inputs.prerelease);
            return response.data.upload_url;
        });
    }
    noPublishedRelease(error) {
        const errorMessage = new ErrorMessage_1.ErrorMessage(error);
        return errorMessage.status == 404;
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const tag = this.inputs.tag;
            const response = yield this.releases.listReleases();
            const releases = response.data;
            const draftRelease = releases.find(release => release.draft && release.tag_name == tag);
            return (_a = draftRelease) === null || _a === void 0 ? void 0 : _a.id;
        });
    }
    createRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.releases.create(this.inputs.tag, this.inputs.body, this.inputs.commit, this.inputs.draft, this.inputs.name, this.inputs.prerelease);
            return response.data.upload_url;
        });
    }
}
exports.Action = Action;
