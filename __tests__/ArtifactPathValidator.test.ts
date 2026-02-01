import * as fs from "node:fs"
import * as core from "@actions/core"
import { describe, expect, it, vi } from "vitest"

vi.mock("@actions/core")
vi.mock("fs")

import { ArtifactPathValidator } from "../src/ArtifactPathValidator.js"

const warnMock = vi.mocked(core.warning)
const mockStatSync = vi.mocked(fs.statSync)
const directoryMock = vi.fn()

// biome-ignore lint/suspicious/noExplicitAny: Partial Stats object for testing
mockStatSync.mockReturnValue({ isDirectory: directoryMock } as any)

const pattern = "pattern"

describe("ArtifactPathValidator", () => {
    beforeEach(() => {
        warnMock.mockClear()
        directoryMock.mockClear()
    })

    it("warns and filters out path which points to a directory", () => {
        const paths = ["path1", "path2"]
        directoryMock.mockReturnValueOnce(true).mockReturnValueOnce(false)

        const validator = new ArtifactPathValidator(false, paths, pattern)

        const result = validator.validate()
        expect(warnMock).toHaveBeenCalled()
        expect(result).toEqual(["path2"])
    })

    it("warns when no glob results are produced and empty results shouldn't throw", () => {
        const validator = new ArtifactPathValidator(false, [], pattern)
        const _result = validator.validate()
        expect(warnMock).toHaveBeenCalled()
    })

    it("throws when no glob results are produced and empty results shouild throw", () => {
        const validator = new ArtifactPathValidator(true, [], pattern)
        expect(() => {
            validator.validate()
        }).toThrow()
    })

    it("throws when path points to directory", () => {
        const paths = ["path1", "path2"]
        directoryMock.mockReturnValueOnce(true).mockReturnValueOnce(false)

        const validator = new ArtifactPathValidator(true, paths, pattern)

        expect(() => {
            validator.validate()
        }).toThrow()
    })
})
