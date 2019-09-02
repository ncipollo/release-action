import { GlobSync } from "glob";

export interface Globber {
    glob(pattern: string): string[]
}

export class FileGlobber implements Globber {
    glob(pattern: string): string[] {
        return new GlobSync(pattern, { mark: true }).found
    }
}