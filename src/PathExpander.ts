import os from "os"

export function expandTilde(path: string): string {
    return path.replace(/^~(?=$|\/|\\)/, os.homedir())
}

