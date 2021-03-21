import * as core from '@actions/core';
import {Globber, FileGlobber} from "./Globber";
import {Artifact} from "./Artifact";
import untildify from "untildify";

export interface ArtifactGlobber {
    globArtifactString(artifact: string, contentType: string, throwsWhenNoFiles: boolean): Artifact[]
}

export class FileArtifactGlobber implements ArtifactGlobber {
    private globber: Globber

    constructor(globber: Globber = new FileGlobber()) {
        this.globber = globber
    }

    globArtifactString(artifact: string, contentType: string, throwsWhenNoFiles: boolean): Artifact[] {
        return artifact.split(',')
            .map(path => FileArtifactGlobber.expandPath(path))
            .map(pattern => this.globPattern(pattern, throwsWhenNoFiles))
            .reduce((accumulated, current) => accumulated.concat(current))
            .map(path => new Artifact(path, contentType))
    }

    private globPattern(pattern: string, throwsWhenNoFiles: boolean): string[] {
        const paths = this.globber.glob(pattern)
        if (paths.length == 0) {
            if (throwsWhenNoFiles) {
                FileArtifactGlobber.throwGlobError(pattern)
            } else {
                FileArtifactGlobber.reportGlobWarning(pattern)
            }
        }
        return paths
    }

    private static reportGlobWarning(pattern: string) {
        core.warning(`Artifact pattern :${pattern} did not match any files`)
    }

    private static throwGlobError(pattern: string) {
        throw Error(`Artifact pattern :${pattern} did not match any files`)
    }

    private static expandPath(path: string): string {
        return untildify(path)
    }
}