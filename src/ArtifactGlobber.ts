import { Globber, FileGlobber } from "./Globber";
import { Artifact } from "./Artifact";

export interface ArtifactGlobber {
    globArtifactString(artifact: string, contentType: string): Artifact[]
}

export class FileArtifactGlobber implements ArtifactGlobber {
    private globber: Globber

    constructor(globber: Globber = new FileGlobber()) {
        this.globber = globber
    }

    globArtifactString(artifact: string, contentType: string): Artifact[] {
        return artifact.split(',')
            .map((path) => this.globber.glob(path))
            .reduce((accumulated, current) => accumulated.concat(current))
            .map((path) => new Artifact(path, contentType))
    }
}

