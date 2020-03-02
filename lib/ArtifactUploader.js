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
    uploadArtifacts(artifacts, releaseId, uploadUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.replacesExistingArtifacts) {
                yield this.deleteUpdatedArtifacts(artifacts, releaseId);
            }
            for (const artifact of artifacts) {
                try {
                    yield this.releases.uploadArtifact(uploadUrl, artifact.contentLength, artifact.contentType, artifact.readFile(), artifact.name);
                }
                catch (error) {
                    const message = `Failed to upload artifact ${artifact.name}. Does it already exist?`;
                    core.warning(message);
                }
            }
            return Promise.resolve();
        });
    }
    deleteUpdatedArtifacts(artifacts, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.releases.listArtifactsForRelease(releaseId);
            const releaseAssets = response.data;
            const assetByName = new Map();
            releaseAssets.forEach(asset => {
                assetByName[asset.name] = asset;
            });
            for (const artifact of artifacts) {
                const asset = assetByName[artifact.name];
                if (asset) {
                    yield this.releases.deleteArtifact(asset.id);
                }
            }
        });
    }
}
exports.GithubArtifactUploader = GithubArtifactUploader;
