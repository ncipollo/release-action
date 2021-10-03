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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileArtifactGlobber = void 0;
const core = __importStar(require("@actions/core"));
const Globber_1 = require("./Globber");
const Artifact_1 = require("./Artifact");
const untildify_1 = __importDefault(require("untildify"));
const ArtifactPathValidator_1 = require("./ArtifactPathValidator");
class FileArtifactGlobber {
    constructor(globber = new Globber_1.FileGlobber()) {
        this.globber = globber;
    }
    globArtifactString(artifact, contentType, errorsFailBuild) {
        return artifact.split(',')
            .map(path => FileArtifactGlobber.expandPath(path))
            .map(pattern => this.globPattern(pattern, errorsFailBuild))
            .map((globResult) => FileArtifactGlobber.validatePattern(errorsFailBuild, globResult[1], globResult[0]))
            .reduce((accumulated, current) => accumulated.concat(current))
            .map(path => new Artifact_1.Artifact(path, contentType));
    }
    globPattern(pattern, errorsFailBuild) {
        const paths = this.globber.glob(pattern);
        if (paths.length == 0) {
            if (errorsFailBuild) {
                FileArtifactGlobber.throwGlobError(pattern);
            }
            else {
                FileArtifactGlobber.reportGlobWarning(pattern);
            }
        }
        return [pattern, paths];
    }
    static validatePattern(errorsFailBuild, paths, pattern) {
        const validator = new ArtifactPathValidator_1.ArtifactPathValidator(errorsFailBuild, paths, pattern);
        return validator.validate();
    }
    static reportGlobWarning(pattern) {
        core.warning(`Artifact pattern :${pattern} did not match any files`);
    }
    static throwGlobError(pattern) {
        throw Error(`Artifact pattern :${pattern} did not match any files`);
    }
    static expandPath(path) {
        return (0, untildify_1.default)(path);
    }
}
exports.FileArtifactGlobber = FileArtifactGlobber;
