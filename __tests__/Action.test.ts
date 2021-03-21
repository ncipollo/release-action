import {Action} from "../src/Action";
import {Artifact} from "../src/Artifact";
import {Inputs} from "../src/Inputs";
import {Releases} from "../src/Releases";
import {ArtifactUploader} from "../src/ArtifactUploader";

const createMock = jest.fn()
const deleteMock = jest.fn()
const getMock = jest.fn()
const listArtifactsMock = jest.fn()
const listMock = jest.fn()
const updateMock = jest.fn()
const uploadMock = jest.fn()

const artifacts = [
    new Artifact('a/art1'),
    new Artifact('b/art2')
]

const artifactErrorsFailBuild = false
const createBody = 'createBody'
const createName = 'createName'
const commit = 'commit'
const draft = true
const id = 100
const prerelease = true
const releaseId = 101
const replacesArtifacts = true
const tag = 'tag'
const token = 'token'
const updateBody = 'updateBody'
const updateName = 'updateName'
const url = 'http://api.example.com'

describe("Action", () => {
    beforeEach(() => {
        createMock.mockClear()
        getMock.mockClear()
        listMock.mockClear()
        updateMock.mockClear()
        uploadMock.mockClear()
    })

    it('creates release but does not upload if no artifact', async () => {
        const action = createAction(false, false)

        await action.perform()

        expect(createMock).toBeCalledWith(tag, createBody, commit, draft, createName, prerelease)
        expect(uploadMock).not.toBeCalled()
    })

    it('creates release if no release exists to update', async () => {
        const action = createAction(true, true)
        const error = {status: 404}
        getMock.mockRejectedValue(error)

        await action.perform()

        expect(createMock).toBeCalledWith(tag, createBody, commit, draft, createName, prerelease)
        expect(uploadMock).toBeCalledWith(artifacts, releaseId, url)
    })

    it('creates release if no draft releases', async () => {
        const action = createAction(true, true)
        const error = {status: 404}
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [
                {id: id, draft: false, tag_name: tag}
            ]
        })

        await action.perform()

        expect(createMock).toBeCalledWith(tag, createBody, commit, draft, createName, prerelease)
        expect(uploadMock).toBeCalledWith(artifacts, releaseId, url)

    })

    it('creates release then uploads artifact', async () => {
        const action = createAction(false, true)

        await action.perform()

        expect(createMock).toBeCalledWith(tag, createBody, commit, draft, createName, prerelease)
        expect(uploadMock).toBeCalledWith(artifacts, releaseId, url)
    })

    it('throws error when create fails', async () => {
        const action = createAction(false, true)
        createMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(createMock).toBeCalledWith(tag, createBody, commit, draft, createName, prerelease)
        expect(uploadMock).not.toBeCalled()
    })

    it('throws error when get fails', async () => {
        const action = createAction(true, true)
        const error = {
            errors: [
                {
                    code: 'already_exists'
                }
            ]
        }

        createMock.mockRejectedValue(error)
        getMock.mockRejectedValue("error")
        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(getMock).toBeCalledWith(tag)
        expect(updateMock).not.toBeCalled()
        expect(uploadMock).not.toBeCalled()

    })

    it('throws error when update fails', async () => {
        const action = createAction(true, true)

        updateMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(updateMock).toBeCalledWith(id, tag, updateBody, commit, draft, updateName, prerelease)
        expect(uploadMock).not.toBeCalled()
    })

    it('throws error when upload fails', async () => {
        const action = createAction(false, true)
        uploadMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(createMock).toBeCalledWith(tag, createBody, commit, draft, createName, prerelease)
        expect(uploadMock).toBeCalledWith(artifacts, releaseId, url)
    })

    it('updates draft release', async () => {
        const action = createAction(true, true)
        const error = {status: 404}
        getMock.mockRejectedValue(error)
        listMock.mockResolvedValue({
            data: [
                {id: 123, draft: false, tag_name: tag},
                {id: id, draft: true, tag_name: tag}
            ]
        })

        await action.perform()

        expect(updateMock).toBeCalledWith(id, tag, updateBody, commit, draft, updateName, prerelease)
        expect(uploadMock).toBeCalledWith(artifacts, releaseId, url)

    })

    it('updates release but does not upload if no artifact', async () => {
        const action = createAction(true, false)

        await action.perform()

        expect(updateMock).toBeCalledWith(id, tag, updateBody, commit, draft, updateName, prerelease)
        expect(uploadMock).not.toBeCalled()

    })

    it('updates release then uploads artifact', async () => {
        const action = createAction(true, true)

        await action.perform()

        expect(updateMock).toBeCalledWith(id, tag, updateBody, commit, draft, updateName, prerelease)
        expect(uploadMock).toBeCalledWith(artifacts, releaseId, url)

    })

    function createAction(allowUpdates: boolean, hasArtifact: boolean): Action {
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
                uploadArtifact: jest.fn()
            }
        })

        createMock.mockResolvedValue({
            data: {
                id: releaseId,
                upload_url: url
            }
        })
        getMock.mockResolvedValue({
            data: {
                id: id
            }
        })
        listMock.mockResolvedValue({
            data: []
        })
        updateMock.mockResolvedValue({
            data: {
                id: releaseId,
                upload_url: url
            }
        })
        uploadMock.mockResolvedValue({})

        const MockInputs = jest.fn<Inputs, any>(() => {
            return {
                allowUpdates: allowUpdates,
                artifactErrorsFailBuild: true,
                artifacts: inputArtifact,
                createdReleaseBody: createBody,
                createdReleaseName: createName,
                commit: commit,
                draft: draft,
                owner: "owner",
                prerelease: prerelease,
                replacesArtifacts: replacesArtifacts,
                repo: "repo",
                tag: tag,
                token: token,
                updatedReleaseBody: updateBody,
                updatedReleaseName: updateName
            }
        })
        const MockUploader = jest.fn<ArtifactUploader, any>(() => {
            return {
                uploadArtifacts: uploadMock
            }
        })

        const inputs = new MockInputs()
        const releases = new MockReleases()
        const uploader = new MockUploader()

        return new Action(inputs, releases, uploader)
    }
})
