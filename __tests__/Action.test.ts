import { Action } from "../src/Action"
import type { ActionSkipper } from "../src/ActionSkipper"
import { Artifact } from "../src/Artifact"
import type { ArtifactDestroyer } from "../src/ArtifactDestroyer"
import type { ArtifactUploader } from "../src/ArtifactUploader"
import type { Inputs } from "../src/Inputs"
import type { Outputs } from "../src/Outputs"
import type { Releases } from "../src/Releases"

const applyReleaseDataMock = jest.fn()
const artifactDestroyMock = jest.fn()
const createMock = jest.fn()
const deleteMock = jest.fn()
const getMock = jest.fn()
const listArtifactsMock = jest.fn()
const listMock = jest.fn()
const shouldSkipMock = jest.fn()
const updateMock = jest.fn()
const uploadMock = jest.fn()
const genReleaseNotesMock = jest.fn()

const artifacts = [new Artifact("a/art1"), new Artifact("b/art2")]

const createBody = "createBody"
const createDraft = true
const createName = "createName"
const commit = "commit"
const discussionCategory = "discussionCategory"
const generateReleaseNotes = true
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
const url = "http://api.example.com"
const makeLatest = "legacy"
const generatedReleaseBody = "test release notes"

describe("Action", () => {
    beforeEach(() => {
        createMock.mockClear()
        getMock.mockClear()
        listMock.mockClear()
        shouldSkipMock.mockClear()
        updateMock.mockClear()
        uploadMock.mockClear()
    })

    it("creates release but does not upload if no artifact", async () => {
        const action = createAction(false, false)

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            createBody,
            commit,
            discussionCategory,
            createDraft,
            generateReleaseNotes,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).not.toHaveBeenCalled()
        assertOutputApplied()
    })

    it("creates release if no release exists to update", async () => {
        const action = createAction(true, true)
        const error = { status: 404 }
        getMock.mockRejectedValue(error)

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            createBody,
            commit,
            discussionCategory,
            createDraft,
            generateReleaseNotes,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
    })

    it("creates release if no draft releases", async () => {
        const action = createAction(true, true)
        const error = { status: 404 }
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [{ id: id, draft: false, tag_name: tag }],
        })

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            createBody,
            commit,
            discussionCategory,
            createDraft,
            generateReleaseNotes,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
    })

    it("creates release then uploads artifact", async () => {
        const action = createAction(false, true)

        await action.perform()

        expect(createMock).toHaveBeenCalledWith(
            tag,
            createBody,
            commit,
            discussionCategory,
            createDraft,
            generateReleaseNotes,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
        assertOutputApplied()
    })

    it("removes all artifacts when artifact destroyer is enabled", async () => {
        const action = createAction(false, true, true)

        await action.perform()

        expect(artifactDestroyMock).toHaveBeenCalledWith(releaseId)
        assertOutputApplied()
    })

    it("removes no artifacts when artifact destroyer is disabled", async () => {
        const action = createAction(false, true)

        await action.perform()

        expect(artifactDestroyMock).not.toHaveBeenCalled()
        assertOutputApplied()
    })

    it("skips action", async () => {
        const action = createAction(false, false, false)
        shouldSkipMock.mockResolvedValue(true)

        await action.perform()

        expect(createMock).not.toHaveBeenCalled()
        expect(updateMock).not.toHaveBeenCalled()
    })

    it("throws error when create fails", async () => {
        const action = createAction(false, true)
        createMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(createMock).toHaveBeenCalledWith(
            tag,
            createBody,
            commit,
            discussionCategory,
            createDraft,
            generateReleaseNotes,
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
        const action = createAction(true, true)

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
        const action = createAction(false, true)
        const expectedError = { status: 404 }
        uploadMock.mockRejectedValue(expectedError)

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual(expectedError)
        }

        expect(createMock).toHaveBeenCalledWith(
            tag,
            createBody,
            commit,
            discussionCategory,
            createDraft,
            generateReleaseNotes,
            makeLatest,
            createName,
            createPrerelease
        )
        expect(uploadMock).toHaveBeenCalledWith(artifacts, releaseId, url)
    })

    it("updates draft release", async () => {
        const action = createAction(true, true)
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
    })

    it("updates release but does not upload if no artifact", async () => {
        const action = createAction(true, false)

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
    })

    it("updates release then uploads artifact", async () => {
        const action = createAction(true, true)

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
    })

    function assertOutputApplied() {
        expect(applyReleaseDataMock).toHaveBeenCalledWith({
            id: releaseId,
            upload_url: url,
        })
    }

    function createAction(
        allowUpdates: boolean,
        hasArtifact: boolean,
        removeArtifacts = false,
        generateReleaseNotes = true
    ): Action {
        let inputArtifact: Artifact[]

        if (hasArtifact) {
            inputArtifact = artifacts
        } else {
            inputArtifact = []
        }

        const MockReleases = jest.fn<Releases, any>(() => {
            return {
                create: createMock,
                deleteArtifact: deleteMock,
                getByTag: getMock,
                listArtifactsForRelease: listArtifactsMock,
                listReleases: listMock,
                update: updateMock,
                uploadArtifact: jest.fn(),
                generateReleaseNotes: genReleaseNotesMock,
            }
        })

        createMock.mockResolvedValue({
            data: {
                id: releaseId,
                upload_url: url,
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
            },
        })
        uploadMock.mockResolvedValue({})

        const MockInputs = jest.fn<Inputs, any>(() => {
            return {
                allowUpdates,
                artifactErrorsFailBuild: true,
                artifacts: inputArtifact,
                createdDraft: createDraft,
                createdReleaseBody: createBody,
                createdReleaseName: createName,
                commit,
                discussionCategory,
                generateReleaseNotes,
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
                updatedReleaseBody: updateBody,
                updatedReleaseName: updateName,
                updatedPrerelease: updatePrerelease,
                updateOnlyUnreleased: updateOnlyUnreleased,
            }
        })
        const MockOutputs = jest.fn<Outputs, any>(() => {
            return {
                applyReleaseData: applyReleaseDataMock,
            }
        })
        const MockUploader = jest.fn<ArtifactUploader, any>(() => {
            return {
                uploadArtifacts: uploadMock,
            }
        })
        const MockArtifactDestroyer = jest.fn<ArtifactDestroyer, any>(() => {
            return {
                destroyArtifacts: artifactDestroyMock,
            }
        })

        const MockActionSkipper = jest.fn<ActionSkipper, any>(() => {
            return {
                shouldSkip: shouldSkipMock,
            }
        })

        const inputs = new MockInputs()
        const outputs = new MockOutputs()
        const releases = new MockReleases()
        const uploader = new MockUploader()
        const artifactDestroyer = new MockArtifactDestroyer()
        const actionSkipper = new MockActionSkipper()

        return new Action(inputs, outputs, releases, uploader, artifactDestroyer, actionSkipper)
    }
})
