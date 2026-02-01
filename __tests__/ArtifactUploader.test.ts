import { RequestError } from "@octokit/request-error"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Artifact } from "../src/Artifact.js"
import { GithubArtifactUploader } from "../src/ArtifactUploader.js"
import type { Releases } from "../src/Releases.js"

const artifacts = [new Artifact("a/art1"), new Artifact("b/art2")]
const fakeReadStream = {}
const contentLength = 42
const releaseId = 100
const url = "http://api.example.com"

const deleteMock = vi.fn()
const listArtifactsMock = vi.fn()
const uploadMock = vi.fn()

// Mock response with browser_download_url
const mockUploadResponse = (name: string) => ({
    data: {
        browser_download_url: `https://github.com/octocat/Hello-World/releases/download/v1.0.0/${name}`,
        name: name,
        id: 1,
    },
})

vi.mock("fs", async () => {
    const originalFs = await vi.importActual<typeof import("fs")>("fs")
    return {
        ...originalFs,
        promises: {},
        createReadStream: () => fakeReadStream,
        statSync: () => {
            return { size: contentLength }
        },
    }
})

describe("ArtifactUploader", () => {
    beforeEach(() => {
        deleteMock.mockClear()
        listArtifactsMock.mockClear()
        uploadMock.mockClear()
    })

    it("returns asset URLs when upload succeeds", async () => {
        mockListWithoutAssets()
        mockUploadSuccess()
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({
            art1: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art1",
            art2: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art2",
        })
        expect(uploadMock).toHaveBeenCalledTimes(2)
    })

    it("returns empty object when no artifacts are uploaded", async () => {
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts([], releaseId, url)

        expect(result).toEqual({})
        expect(uploadMock).toHaveBeenCalledTimes(0)
    })

    it("excludes failed uploads from returned URLs", async () => {
        mockListWithoutAssets()
        mockUploadArtifact(401, 2)
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({})
        expect(uploadMock).toHaveBeenCalledTimes(2)
    })

    it("abort when upload failed with non-5xx response", async () => {
        mockListWithoutAssets()
        mockUploadArtifact(401, 2)
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({})
        expect(uploadMock).toHaveBeenCalledTimes(2)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(0)
    })

    it("abort when upload failed with 5xx response after 3 attempts", async () => {
        mockListWithoutAssets()
        mockUploadArtifact(500, 4)
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({})
        expect(uploadMock).toHaveBeenCalledTimes(5)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(0)
    })

    it("replaces all artifacts", async () => {
        mockDeleteSuccess()
        mockListWithAssets()
        mockUploadSuccess()
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({
            art1: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art1",
            art2: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art2",
        })
        expect(uploadMock).toHaveBeenCalledTimes(2)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(2)
        expect(deleteMock).toHaveBeenCalledWith(1)
        expect(deleteMock).toHaveBeenCalledWith(2)
    })

    it("replaces no artifacts when previous asset list empty", async () => {
        mockDeleteSuccess()
        mockListWithoutAssets()
        mockUploadSuccess()
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({
            art1: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art1",
            art2: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art2",
        })
        expect(uploadMock).toHaveBeenCalledTimes(2)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(0)
    })

    it("retry when upload failed with 5xx response", async () => {
        mockListWithoutAssets()
        mockUploadArtifact(500, 2)
        const uploader = createUploader(true)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({})
        expect(uploadMock).toHaveBeenCalledTimes(4)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(0)
    })

    it("throws upload error when replacesExistingArtifacts is true", async () => {
        mockListWithoutAssets()
        mockUploadError()
        const uploader = createUploader(true, true)

        expect.hasAssertions()
        try {
            await uploader.uploadArtifacts(artifacts, releaseId, url)
        } catch (error) {
            expect(error).toEqual(Error("Failed to upload artifact art1. error."))
        }
    })

    it("throws error from replace", async () => {
        mockDeleteError()
        mockListWithAssets()
        mockUploadSuccess()
        const uploader = createUploader(true)

        expect.hasAssertions()
        try {
            await uploader.uploadArtifacts(artifacts, releaseId, url)
        } catch (error) {
            expect(error).toEqual("error")
        }
    })

    it("updates all artifacts, delete none", async () => {
        mockDeleteError()
        mockListWithAssets()
        mockUploadSuccess()
        const uploader = createUploader(false)

        const result = await uploader.uploadArtifacts(artifacts, releaseId, url)

        expect(result).toEqual({
            art1: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art1",
            art2: "https://github.com/octocat/Hello-World/releases/download/v1.0.0/art2",
        })
        expect(uploadMock).toHaveBeenCalledTimes(2)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art1", releaseId)
        expect(uploadMock).toHaveBeenCalledWith(url, contentLength, "raw", fakeReadStream, "art2", releaseId)

        expect(deleteMock).toHaveBeenCalledTimes(0)
    })

    function createUploader(replaces: boolean, throws = false): GithubArtifactUploader {
        const MockReleases = vi.fn<() => Releases>(() => {
            return {
                create: vi.fn(),
                deleteArtifact: deleteMock,
                getByTag: vi.fn(),
                listArtifactsForRelease: listArtifactsMock,
                listReleases: vi.fn(),
                update: vi.fn(),
                uploadArtifact: uploadMock,
                generateReleaseNotes: vi.fn(),
            }
        })
        return new GithubArtifactUploader(MockReleases(), replaces, throws)
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

    function mockUploadSuccess() {
        uploadMock.mockImplementation((_, __, ___, ____, name) => Promise.resolve(mockUploadResponse(name)))
    }

    function mockUploadArtifact(status = 200, failures = 0) {
        const error = new RequestError(`HTTP ${status}`, status, {
            headers: {},
            request: { method: "GET", url: "", headers: {} },
        })
        for (let index = 0; index < failures; index++) {
            uploadMock.mockRejectedValueOnce(error)
        }
        uploadMock.mockResolvedValue({})
    }

    function mockUploadError() {
        uploadMock.mockRejectedValue({
            message: "error",
            status: 502,
        })
    }
})
