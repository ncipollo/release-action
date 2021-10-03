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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactPathValidator = void 0;
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
class ArtifactPathValidator {
    constructor(errorsFailBuild, paths, pattern) {
        this.paths = paths;
        this.pattern = pattern;
        this.errorsFailBuild = errorsFailBuild;
    }
    validate() {
        this.verifyPathsNotEmpty();
        return this.paths.filter((path) => this.verifyNotDirectory(path));
    }
    verifyPathsNotEmpty() {
        if (this.paths.length == 0) {
            const message = `Artifact pattern:${this.pattern} did not match any files`;
            this.reportError(message);
        }
    }
    verifyNotDirectory(path) {
        const isDir = (0, fs_1.statSync)(path).isDirectory();
        if (isDir) {
            const message = `Artifact is a directory:${path}. Directories can not be uploaded to a release.`;
            this.reportError(message);
        }
        return !isDir;
    }
    reportError(message) {
        if (this.errorsFailBuild) {
            throw Error(message);
        }
        else {
            core.warning(message);
        }
    }
}
exports.ArtifactPathValidator = ArtifactPathValidator;
