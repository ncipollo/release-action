const warnMock = jest.fn()

import { FileArtifactGlobber } from "../src/ArtifactGlobber"
import { Globber } from "../src/Globber"
import { Artifact } from "../src/Artifact"
import { expandTilde } from "../src/PathExpander"

const contentType = "raw"
const globMock = jest.fn()
const globResults = ["file1", "file2"]

jest.mock("@actions/core", () => {
    return { warning: warnMock }
})

jest.mock("fs", () => {
    return {
        statSync: () => {
            return {
                isDirectory(): boolean {
                    return false
                },
            }
        },
        realpathSync: () => {
            return false
        },
    }
})

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
        const MockGlobber = jest.fn<Globber, any>(() => {
            return {
                glob: globMock,
            }
        })
        globMock.mockReturnValue(results)
        return new FileArtifactGlobber(new MockGlobber())
    }
})
