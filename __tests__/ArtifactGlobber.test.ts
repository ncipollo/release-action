import * as fs from "node:fs"
import * as core from "@actions/core"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@actions/core")
vi.mock("fs")

import { Artifact } from "../src/Artifact.js"
import { FileArtifactGlobber } from "../src/ArtifactGlobber.js"
import type { Globber } from "../src/Globber.js"
import { expandTilde } from "../src/PathExpander.js"

const warnMock = vi.mocked(core.warning)
const mockStatSync = vi.mocked(fs.statSync)
// biome-ignore lint/suspicious/noExplicitAny: fs.realpathSync has overloads that are difficult to type
const mockRealpathSync = vi.mocked(fs.realpathSync as any)

const contentType = "raw"
const globMock = vi.fn()
const globResults = ["file1", "file2"]

mockStatSync.mockReturnValue({
    isDirectory(): boolean {
        return false
    },
    // biome-ignore lint/suspicious/noExplicitAny: Partial Stats object for testing
} as any)

// biome-ignore lint/suspicious/noExplicitAny: Mock return value for testing
mockRealpathSync.mockReturnValue(false as any)

describe("ArtifactGlobber", () => {
    beforeEach(() => {
        globMock.mockClear()
    })

    it("expands paths in which start with a ~", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts = globResults.map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString("~/path", "raw", false)).toEqual(expectedArtifacts)
        expect(globMock).toHaveBeenCalledWith(expandTilde("~/path"))
        expect(warnMock).not.toHaveBeenCalled()
    })

    it("globs simple path", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts = globResults.map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString("path", "raw", false)).toEqual(expectedArtifacts)
        expect(globMock).toHaveBeenCalledWith("path")
        expect(warnMock).not.toHaveBeenCalled()
    })

    it("splits multiple paths with comma separator", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts = globResults.concat(globResults).map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString("path1,path2", "raw", false)).toEqual(expectedArtifacts)
        expect(globMock).toHaveBeenCalledWith("path1")
        expect(globMock).toHaveBeenCalledWith("path2")
        expect(warnMock).not.toHaveBeenCalled()
    })

    it("splits multiple paths with new line separator and trims start", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts = globResults.concat(globResults).map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString("path1\n  path2", "raw", false)).toEqual(expectedArtifacts)
        expect(globMock).toHaveBeenCalledWith("path1")
        expect(globMock).toHaveBeenCalledWith("path2")
        expect(warnMock).not.toHaveBeenCalled()
    })

    it("warns when no glob results are produced and empty results shouldn't throw", () => {
        const globber = createArtifactGlobber([])

        expect(globber.globArtifactString("path", "raw", false)).toEqual([])
        expect(warnMock).toHaveBeenCalled()
    })

    it("throws when no glob results are produced and empty results shouild throw", () => {
        const globber = createArtifactGlobber([])
        expect(() => {
            globber.globArtifactString("path", "raw", true)
        }).toThrow()
    })

    function createArtifactGlobber(results: string[] = globResults): FileArtifactGlobber {
        const MockGlobber = vi.fn<() => Globber>(() => {
            return {
                glob: globMock,
            }
        })
        globMock.mockReturnValue(results)
        return new FileArtifactGlobber(MockGlobber())
    }
})
