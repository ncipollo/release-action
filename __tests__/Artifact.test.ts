import * as fs from "node:fs"
import { describe, expect, it, vi } from "vitest"
import { Artifact } from "../src/Artifact.js"

vi.mock("fs")

const contentLength = 42
const fakeReadStream = {}

const mockCreateReadStream = vi.mocked(fs.createReadStream)
const mockStatSync = vi.mocked(fs.statSync)

// biome-ignore lint/suspicious/noExplicitAny: Mock object for testing
mockCreateReadStream.mockReturnValue(fakeReadStream as any)
// biome-ignore lint/suspicious/noExplicitAny: Partial Stats object for testing
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
