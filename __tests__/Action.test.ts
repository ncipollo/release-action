import { beforeEach, describe, expect, it, vi } from "vitest"
import { Action } from "../src/Action.js"
import type { ActionSkipper } from "../src/ActionSkipper.js"
import { Artifact } from "../src/Artifact.js"
import type { ArtifactDestroyer } from "../src/ArtifactDestroyer.js"
import type { ArtifactUploader } from "../src/ArtifactUploader.js"
import type { Inputs } from "../src/Inputs.js"
import type { Outputs } from "../src/Outputs.js"
import type { Releases } from "../src/Releases.js"

const TEST_URLS = {
    UPLOAD_URL: "http://api.example.com",
    HTML_URL: "https://github.com/owner/repo/releases/tag/v1.0.0",
    TARBALL_URL: "https://api.github.com/repos/owner/repo/tarball/v1.0.0",
    ZIPBALL_URL: "https://api.github.com/repos/owner/repo/zipball/v1.0.0",
} as const

const applyReleaseDataMock = vi.fn()
const applyAssetUrlsMock = vi.fn()
const artifactDestroyMock = vi.fn()
const createMock = vi.fn()
const deleteMock = vi.fn()
const getMock = vi.fn()
const listArtifactsMock = vi.fn()
const listMock = vi.fn()
const shouldSkipMock = vi.fn()
const updateMock = vi.fn()
const uploadMock = vi.fn()
const genReleaseNotesMock = vi.fn()

const artifacts = [new Artifact("a/art1"), new Artifact("b/art2")]

const createBody = "createBody"
const createDraft = true
const createName = "createName"
const commit = "commit"
const discussionCategory = "discussionCategory"
const _generateReleaseNotes = true
const id = 100
const createPrerelease = true
const releaseId = 101
const replacesArtifacts = true
const tag = "tag"
const token = "token"
const updateBody = "updateBody"
const updateDraft = false
const updateName = "updateName"
const updatePrerelease = false
const updateOnlyUnreleased = false
const url = TEST_URLS.UPLOAD_URL
const makeLatest = "legacy"
const generatedReleaseBody = "test release notes"
const previousTag = "v1.0.0"

describe("Action", () => {
    beforeEach(() => {
        applyReleaseDataMock.mockClear()
        applyAssetUrlsMock.mockClear()
        artifactDestroyMock.mockClear()
        createMock.mockClear()
        genReleaseNotesMock.mockClear()
        getMock.mockClear()
        listMock.mockClear()
        shouldSkipMock.mockClear()
        updateMock.mockClear()
        uploadMock.mockClear()
    })

    it("creates release with generated release notes when no body provided", async () => {
        const action = createAction(false, false, false, true, false, "")

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({})
    })

    it("creates release with generated release notes that override existing body", async () => {
        const action = createAction(false, false, false, true, false, "")

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({})
    })

    it("creates release with static body when generateReleaseNotes is false", async () => {
        const action = createAction(false, false, false, false, false, "static body")

        await action.perform()

        expect(genReleaseNotesMock).not.toHaveBeenCalled()
        expect(createMock).toHaveBeenCalledWith(
            tag,
            "static body",
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({})
    })

    it("creates release with combined body and generated release notes", async () => {
        const action = createAction(false, false, false, true, false, createBody)

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            `${createBody}\n${generatedReleaseBody}`,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({})
    })

    it("creates release with combined body and generated release notes using previous tag", async () => {
        const action = createAction(
            false,
            false,
            false,
            true,
            false,
            createBody,
            true,
            createDraft,
            updateBody,
            previousTag
        )

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, previousTag)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            `${createBody}\n${generatedReleaseBody}`,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
    })

    it("creates release but does not upload if no artifact", async () => {
        const action = createAction(false, false, false, true, false, "")

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({})
    })

    it("creates release if no release exists to update", async () => {
        const action = createAction(true, true, false, true, false, "")
        const error = { status: 404 }
        getMock.mockRejectedValue(error)

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("creates release if no draft releases", async () => {
        const action = createAction(true, true, false, true, false, "")
        const error = { status: 404 }
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [{ id: id, draft: false, tag_name: tag }],
        })

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("creates release then uploads artifact", async () => {
        const action = createAction(false, true, false, true, false, "")

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("removes all artifacts when artifact destroyer is enabled", async () => {
        const action = createAction(false, true, true)

        await action.perform()

        expect(artifactDestroyMock).toHaveBeenCalledWith(releaseId)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("removes no artifacts when artifact destroyer is disabled", async () => {
        const action = createAction(false, true)

        await action.perform()

        expect(artifactDestroyMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("skips action", async () => {
        const action = createAction(false, false, false)
        shouldSkipMock.mockResolvedValue(true)

        await action.perform()

        expect(createMock).not.toHaveBeenCalled()
        expect(updateMock).not.toHaveBeenCalled()
    })

    it("throws error when create fails", async () => {
        const action = createAction(false, true, false, true, false, "")
        createMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
    })

    it("throws error when get fails", async () => {
        const action = createAction(true, true)
        const error = {
            errors: [
                {
                    code: "already_exists",
                },
            ],
        }

        createMock.mockRejectedValue(error)
        getMock.mockRejectedValue("error")
        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(getMock).toHaveBeenCalledWith(tag)
        expect(updateMock).not.toHaveBeenCalled()
        expect(uploadMock).not.toHaveBeenCalled()
    })

    it("throws error when list has no data", async () => {
        const action = createAction(true, true)
        getMock.mockRejectedValue({ status: 404 })
        const error = {
            errors: [
                {
                    code: "already_exists",
                },
            ],
        }

        createMock.mockRejectedValue(error)
        listMock.mockResolvedValue({})
        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual(Error("No releases found. Response: {}"))
        }

        expect(listMock).toHaveBeenCalled()
        expect(createMock).not.toHaveBeenCalled()
        expect(updateMock).not.toHaveBeenCalled()
    })

    it("throws error when update fails", async () => {
        const action = createAction(true, true, false, true, false, "", true, createDraft, "")

        updateMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
    })

    it("throws error when upload fails", async () => {
        const action = createAction(false, true, false, true, false, "")
        const expectedError = { status: 404 }
        uploadMock.mockRejectedValue(expectedError)

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual(expectedError)
        }

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            createDraft,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
    })

    it("updates draft release", async () => {
        const action = createAction(true, true, false, true, false, "", true, createDraft, "")
        const error = { status: 404 }
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [
                { id: 123, draft: false, tag_name: tag },
                { id: id, draft: true, tag_name: tag },
            ],
        })

        await action.perform()

        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("updates draft release with static body", async () => {
        const action = createAction(true, true, false, false)
        const error = { status: 404 }
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [
                { id: 123, draft: false, tag_name: tag },
                { id: id, draft: true, tag_name: tag },
            ],
        })

        await action.perform()

        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            updateBody,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("updates release with combined body and generated release notes", async () => {
        const action = createAction(true, true, false, true, false, "", true, createDraft, updateBody)

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, undefined)
        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            `${updateBody}\n${generatedReleaseBody}`,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("updates release with combined body and generated release notes using previous tag", async () => {
        const action = createAction(true, true, false, true, false, "", true, createDraft, updateBody, previousTag)

        await action.perform()

        expect(genReleaseNotesMock).toHaveBeenCalledWith(tag, previousTag)
        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            `${updateBody}\n${generatedReleaseBody}`,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
    })

    it("updates release but does not upload if no artifact", async () => {
        const action = createAction(true, false, false, true, false, "", true, createDraft, "")

        await action.perform()

        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
        assertAssetUrlsApplied({})
    })

    it("updates release then uploads artifact", async () => {
        const action = createAction(true, true, false, true, false, "", true, createDraft, "")

        await action.perform()

        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("updates release with static body when generateReleaseNotes is true but omitBodyDuringUpdate is true", async () => {
        const action = createAction(true, true, false, true, true)
        const error = { status: 404 }
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [
                { id: 123, draft: false, tag_name: tag },
                { id: id, draft: true, tag_name: tag },
            ],
        })

        await action.perform()

        expect(updateMock).toHaveBeenCalledWith(
            id,
            tag,
            updateBody,
            commit,
            discussionCategory,
            updateDraft,
            makeLatest,
            updateName,
            updatePrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("does not publish immutable release when immutableCreate is false", async () => {
        const action = createAction(false, true, false, true, false, "", false, false)

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            false, // draft should be false when createdDraft is false
            makeLatest,
            createName,
            createPrerelease
        )
        // Should only call update once for regular create, not for publishImmutableRelease
        expect(updateMock).not.toHaveBeenCalled()
        assertOutputApplied()
    })

    it("does not publish immutable release when createdDraft is true", async () => {
        const action = createAction(false, true, false, true, false, "", true, true)

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            true, // draft should be true when createdDraft is true or immutableCreate is true
            makeLatest,
            createName,
            createPrerelease
        )
        // Should only call update once for regular create, not for publishImmutableRelease
        expect(updateMock).not.toHaveBeenCalled()
        assertOutputApplied()
    })

    it("publishes immutable release when immutableCreate is true and createdDraft is false", async () => {
        const action = createAction(false, true, false, true, false, "", true, false)
        const immutableReleaseResponse = {
            data: {
                id: 999,
                upload_url: "http://immutable.example.com",
                html_url: "https://github.com/owner/repo/releases/tag/v1.0.0-immutable",
                tarball_url: "https://api.github.com/repos/owner/repo/tarball/v1.0.0-immutable",
                zipball_url: "https://api.github.com/repos/owner/repo/zipball/v1.0.0-immutable",
            },
        }
        updateMock.mockResolvedValueOnce(immutableReleaseResponse)

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            true, // draft should be true when immutableCreate is true
            makeLatest,
            createName,
            createPrerelease
        )
        // Should call update for publishImmutableRelease
        expect(updateMock).toHaveBeenCalledWith(
            releaseId,
            tag,
            undefined, // body is omitted
            undefined, // commit is omitted
            discussionCategory,
            false, // draft is set to false to publish the release
            makeLatest,
            createName,
            createPrerelease
        )
        // Should apply the immutable release data instead of the original
        expect(applyReleaseDataMock).toHaveBeenCalledWith(immutableReleaseResponse.data)
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    it("publishes immutable release when allowUpdates is true but release does not exist", async () => {
        const action = createAction(true, true, false, true, false, "", true, false)
        const error = { status: 404 }
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({ data: [] }) // No draft releases found

        const immutableReleaseResponse = {
            data: {
                id: 888,
                upload_url: "http://immutable-update.example.com",
                html_url: "https://github.com/owner/repo/releases/tag/v1.0.0-immutable-update",
                tarball_url: "https://api.github.com/repos/owner/repo/tarball/v1.0.0-immutable-update",
                zipball_url: "https://api.github.com/repos/owner/repo/zipball/v1.0.0-immutable-update",
            },
        }
        updateMock.mockResolvedValueOnce(immutableReleaseResponse)

        await action.perform()

        // Should try to get the release first (allowUpdates=true)
        expect(getMock).toHaveBeenCalledWith(tag)
        // Should check for draft releases when get fails with 404
        expect(listMock).toHaveBeenCalled()
        // Should create a new release when no drafts found
        expect(createMock).toHaveBeenCalledWith(
            tag,
            generatedReleaseBody,
            commit,
            discussionCategory,
            true, // draft should be true when immutableCreate is true
            makeLatest,
            createName,
            createPrerelease
        )
        // Should call update for publishImmutableRelease
        expect(updateMock).toHaveBeenCalledWith(
            releaseId,
            tag,
            undefined, // body is omitted
            undefined, // commit is omitted
            discussionCategory,
            false, // draft is set to false to publish the release
            makeLatest,
            createName,
            createPrerelease
        )
        // Should apply the immutable release data instead of the original
        expect(applyReleaseDataMock).toHaveBeenCalledWith(immutableReleaseResponse.data)
        assertAssetUrlsApplied({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })
    })

    function assertOutputApplied() {
        expect(applyReleaseDataMock).toHaveBeenCalledWith({
            id: releaseId,
            upload_url: url,
            html_url: TEST_URLS.HTML_URL,
            tarball_url: TEST_URLS.TARBALL_URL,
            zipball_url: TEST_URLS.ZIPBALL_URL,
        })
    }

    function assertAssetUrlsApplied(expectedUrls: Record<string, string>) {
        expect(applyAssetUrlsMock).toHaveBeenCalledWith(expectedUrls)
    }

    function createAction(
        allowUpdates: boolean,
        hasArtifact: boolean,
        removeArtifacts = false,
        generateReleaseNotes = true,
        omitBodyDuringUpdate = false,
        createdReleaseBody = createBody,
        immutableCreate = true,
        createdDraft = createDraft,
        updatedReleaseBody = updateBody,
        generateReleaseNotesPreviousTag: string | undefined = undefined
    ): Action {
        let inputArtifact: Artifact[]

        if (hasArtifact) {
            inputArtifact = artifacts
        } else {
            inputArtifact = []
        }

        const MockReleases = vi.fn<() => Releases>(() => {
            return {
                create: createMock,
                deleteArtifact: deleteMock,
                getByTag: getMock,
                listArtifactsForRelease: listArtifactsMock,
                listReleases: listMock,
                update: updateMock,
                uploadArtifact: vi.fn(),
                generateReleaseNotes: genReleaseNotesMock,
            }
        })

        createMock.mockResolvedValue({
            data: {
                id: releaseId,
                upload_url: url,
                html_url: TEST_URLS.HTML_URL,
                tarball_url: TEST_URLS.TARBALL_URL,
                zipball_url: TEST_URLS.ZIPBALL_URL,
            },
        })

        genReleaseNotesMock.mockResolvedValue({
            data: {
                body: generatedReleaseBody,
            },
        })
        getMock.mockResolvedValue({
            data: {
                id: id,
            },
        })
        listMock.mockResolvedValue({
            data: [],
        })
        shouldSkipMock.mockResolvedValue(false)
        updateMock.mockResolvedValue({
            data: {
                id: releaseId,
                upload_url: url,
                html_url: TEST_URLS.HTML_URL,
                tarball_url: TEST_URLS.TARBALL_URL,
                zipball_url: TEST_URLS.ZIPBALL_URL,
            },
        })
        uploadMock.mockResolvedValue({
            art1: "https://github.com/owner/repo/releases/download/v1.0.0/art1",
            art2: "https://github.com/owner/repo/releases/download/v1.0.0/art2",
        })

        const MockInputs = vi.fn<() => Inputs>(() => {
            return {
                allowUpdates,
                artifactErrorsFailBuild: true,
                artifacts: inputArtifact,
                createdDraft: createdDraft,
                createdReleaseBody: createdReleaseBody,
                createdReleaseName: createName,
                commit,
                discussionCategory,
                generateReleaseNotes,
                generateReleaseNotesPreviousTag: generateReleaseNotesPreviousTag,
                immutableCreate: immutableCreate,
                makeLatest: makeLatest,
                owner: "owner",
                createdPrerelease: createPrerelease,
                replacesArtifacts,
                removeArtifacts,
                repo: "repo",
                skipIfReleaseExists: false,
                tag,
                token,
                updatedDraft: updateDraft,
                updatedReleaseBody: updatedReleaseBody,
                updatedReleaseName: updateName,
                updatedPrerelease: updatePrerelease,
                updateOnlyUnreleased: updateOnlyUnreleased,
                omitBodyDuringUpdate,
            }
        })
        const MockOutputs = vi.fn<() => Outputs>(() => {
            return {
                applyReleaseData: applyReleaseDataMock,
                applyAssetUrls: applyAssetUrlsMock,
            }
        })
        const MockUploader = vi.fn<() => ArtifactUploader>(() => {
            return {
                uploadArtifacts: uploadMock,
            }
        })
        const MockArtifactDestroyer = vi.fn<() => ArtifactDestroyer>(() => {
            return {
                destroyArtifacts: artifactDestroyMock,
            }
        })

        const MockActionSkipper = vi.fn<() => ActionSkipper>(() => {
            return {
                shouldSkip: shouldSkipMock,
            }
        })

        const inputs = MockInputs()
        const outputs = MockOutputs()
        const releases = MockReleases()
        const uploader = MockUploader()
        const artifactDestroyer = MockArtifactDestroyer()
        const actionSkipper = MockActionSkipper()

        return new Action(inputs, outputs, releases, uploader, artifactDestroyer, actionSkipper)
    }
})
