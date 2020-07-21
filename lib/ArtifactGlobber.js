"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileArtifactGlobber = void 0;
const Globber_1 = require("./Globber");
const Artifact_1 = require("./Artifact");
class FileArtifactGlobber {
    constructor(globber = new Globber_1.FileGlobber()) {
        this.globber = globber;
    }
    globArtifactString(artifact, contentType) {
        return artifact.split(',')
            .map((path) => this.globber.glob(path))
            .reduce((accumulated, current) => accumulated.concat(current))
            .map((path) => new Artifact_1.Artifact(path, contentType));
    }
}
exports.FileArtifactGlobber = FileArtifactGlobber;
