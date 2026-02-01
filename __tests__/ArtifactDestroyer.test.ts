import { beforeEach, describe, expect, it, vi } from "vitest"
import { GithubArtifactDestroyer } from "../src/ArtifactDestroyer.js"
import type { Releases } from "../src/Releases.js"

const releaseId = 100

const deleteMock = vi.fn()
const listArtifactsMock = vi.fn()

describe("ArtifactDestroyer", () => {
    beforeEach(() => {
        deleteMock.mockClear()
        listArtifactsMock.mockClear()
    })

    it("destroys all artifacts", async () => {
        mockListWithAssets()
        mockDeleteSuccess()
        const destroyer = createDestroyer()

        await destroyer.destroyArtifacts(releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(2)
    })

    it("destroys nothing when no artifacts found", async () => {
        mockListWithoutAssets()
        const destroyer = createDestroyer()

        await destroyer.destroyArtifacts(releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(0)
    })

    it("throws when delete call fails", async () => {
        mockListWithAssets()
        mockDeleteError()
        const destroyer = createDestroyer()

        expect.hasAssertions()
        try {
            await destroyer.destroyArtifacts(releaseId)
        } catch (error) {
            expect(error).toEqual("error")
        }
    })

    function createDestroyer(): GithubArtifactDestroyer {
        const MockReleases = vi.fn<() => Releases>(() => {
            return {
                create: vi.fn(),
                deleteArtifact: deleteMock,
                getByTag: vi.fn(),
                listArtifactsForRelease: listArtifactsMock,
                listReleases: vi.fn(),
                update: vi.fn(),
                uploadArtifact: vi.fn(),
                generateReleaseNotes: vi.fn(),
            }
        })
        return new GithubArtifactDestroyer(MockReleases())
    }

    function mockDeleteError(): void {
        deleteMock.mockRejectedValue("error")
    }

    function mockDeleteSuccess(): void {
        deleteMock.mockResolvedValue({})
    }

    function mockListWithAssets() {
        listArtifactsMock.mockResolvedValue([
            {
                name: "art1",
                id: 1,
            },
            {
                name: "art2",
                id: 2,
            },
        ])
    }

    function mockListWithoutAssets() {
        listArtifactsMock.mockResolvedValue([])
    }
})
