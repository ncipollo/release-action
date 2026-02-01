import { describe, expect, it, vi } from "vitest"
import { ReleaseActionSkipper } from "../src/ActionSkipper.js"
import type { Releases } from "../src/Releases.js"

describe("shouldSkip", () => {
    const getMock = vi.fn()
    const tag = "tag"
    const MockReleases = vi.fn<() => Releases>(() => {
        return {
            create: vi.fn(),
            deleteArtifact: vi.fn(),
            getByTag: getMock,
            listArtifactsForRelease: vi.fn(),
            listReleases: vi.fn(),
            update: vi.fn(),
            uploadArtifact: vi.fn(),
            generateReleaseNotes: vi.fn(),
        }
    })

    it("should return false when skipIfReleaseExists is false", async () => {
        const actionSkipper = new ReleaseActionSkipper(false, MockReleases(), tag)
        expect(await actionSkipper.shouldSkip()).toBe(false)
    })

    it("should return false when error occurs", async () => {
        getMock.mockRejectedValue(new Error())

        const actionSkipper = new ReleaseActionSkipper(true, MockReleases(), tag)
        expect(await actionSkipper.shouldSkip()).toBe(false)
    })

    it("should return false when release does not exist", async () => {
        getMock.mockResolvedValue({})

        const actionSkipper = new ReleaseActionSkipper(true, MockReleases(), tag)
        expect(await actionSkipper.shouldSkip()).toBe(false)
    })

    it("should return true when release does exist", async () => {
        getMock.mockResolvedValue({ data: {} })

        const actionSkipper = new ReleaseActionSkipper(true, MockReleases(), tag)
        expect(await actionSkipper.shouldSkip()).toBe(true)
    })
})
