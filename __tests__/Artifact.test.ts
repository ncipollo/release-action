import { describe, expect, it, vi } from "vitest"
import { Artifact } from "../src/Artifact.js"
import * as fs from "fs"

vi.mock("fs")

const contentLength = 42
const fakeReadStream = {}

const mockCreateReadStream = vi.mocked(fs.createReadStream)
const mockStatSync = vi.mocked(fs.statSync)

mockCreateReadStream.mockReturnValue(fakeReadStream as any)
mockStatSync.mockReturnValue({ size: contentLength } as any)

describe("Artifact", () => {
    it("defaults contentType to raw", () => {
        const artifact = new Artifact("")
        expect(artifact.contentType).toBe("raw")
    })

    it("generates name from path", () => {
        const artifact = new Artifact("some/artifact")
        expect(artifact.name).toBe("artifact")
    })

    it("provides contentLength", () => {
        const artifact = new Artifact("some/artifact")
        expect(artifact.contentLength).toBe(contentLength)
    })

    it("provides path", () => {
        const artifact = new Artifact("some/artifact")
        expect(artifact.path).toBe("some/artifact")
    })

    it("reads artifact", () => {
        const artifact = new Artifact("some/artifact")
        expect(artifact.readFile()).toBe(fakeReadStream)
    })
})
