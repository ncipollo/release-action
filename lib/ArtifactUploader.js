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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.GithubArtifactUploader = void 0;
const core = __importStar(require("@actions/core"));
class GithubArtifactUploader {
    constructor(releases, replacesExistingArtifacts = true, throwsUploadErrors = false) {
        this.releases = releases;
        this.replacesExistingArtifacts = replacesExistingArtifacts;
        this.throwsUploadErrors = throwsUploadErrors;
    }
    uploadArtifacts(artifacts, releaseId, uploadUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.replacesExistingArtifacts) {
                yield this.deleteUpdatedArtifacts(artifacts, releaseId);
            }
            for (const artifact of artifacts) {
                yield this.uploadArtifact(artifact, releaseId, uploadUrl);
            }
        });
    }
    uploadArtifact(artifact, releaseId, uploadUrl, retry = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                core.debug(`Uploading artifact ${artifact.name}...`);
                yield this.releases.uploadArtifact(uploadUrl, artifact.contentLength, artifact.contentType, artifact.readFile(), artifact.name, releaseId);
            }
            catch (error) {
                if (error.status >= 500 && retry > 0) {
                    core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}. Retrying...`);
                    yield this.uploadArtifact(artifact, releaseId, uploadUrl, retry - 1);
                }
                else {
                    if (this.throwsUploadErrors) {
                        throw Error(`Failed to upload artifact ${artifact.name}. ${error.message}.`);
                    }
                    else {
                        core.warning(`Failed to upload artifact ${artifact.name}. ${error.message}.`);
                    }
                }
            }
        });
    }
    deleteUpdatedArtifacts(artifacts, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.releases.listArtifactsForRelease(releaseId);
            const releaseAssets = response.data;
            const assetByName = {};
            releaseAssets.forEach(asset => {
                assetByName[asset.name] = asset;
            });
            for (const artifact of artifacts) {
                const asset = assetByName[artifact.name];
                if (asset) {
                    core.debug(`Deleting existing artifact ${artifact.name}...`);
                    yield this.releases.deleteArtifact(asset.id);
                }
            }
        });
    }
}
exports.GithubArtifactUploader = GithubArtifactUploader;
