import { Action } from "../src/Action";
import { Artifact } from "../src/Artifact";
import { Inputs } from "../src/Inputs";
import { Releases } from "../src/Releases";
import { ArtifactUploader } from "../src/ArtifactUploader";

const createMock = jest.fn()
const getMock = jest.fn()
const updateMock = jest.fn()
const uploadMock = jest.fn()

const artifacts = [
    new Artifact('a/art1'),
    new Artifact('b/art2')
]
const artifactData = Buffer.from('blob', 'utf-8')
const body = 'body'
const commit = 'commit'
const draft = true
const id = 100
const name = 'name'
const tag = 'tag'
const token = 'token'
const url = 'http://api.example.com'

describe("Action", () => {
    beforeEach(() => {
        createMock.mockClear()
        getMock.mockClear()
        updateMock.mockClear()
        uploadMock.mockClear()
    })

    it('creates release but does not upload if no artifact', async () => {
        const action = createAction(false, false)

        await action.perform()

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).not.toBeCalled()
    })

    it('creates release then uploads artifact', async () => {
        const action = createAction(false, true)

        await action.perform()

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).toBeCalledWith(artifacts, url)
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

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).not.toBeCalled()
    })

    it('throws error when get fails', async () => {
        const action = createAction(true, false)
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
        
        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).not.toBeCalled()
        
    })

    it('throws error when update fails', async () => {
        const action = createAction(true, false)
        const error = {
            errors: [
                {
                    code: 'already_exists'
                }
            ]
        }
        
        createMock.mockRejectedValue(error)
        updateMock.mockRejectedValue("error")
        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }
        
        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
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

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).toBeCalledWith(artifacts, url)
    })

    it('updates release but does not upload if no artifact', async () => {
        const action = createAction(true, false)
        const error = {
            errors: [
                {
                    code: 'already_exists'
                }
            ]
        }
        
        createMock.mockRejectedValue(error)

        await action.perform()
        
        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).not.toBeCalled()
        
    })

    it('updates release then uploads artifact', async () => {
        const action = createAction(true, true)
        const error = {
            errors: [
                {
                    code: 'already_exists'
                }
            ]
        }
        
        createMock.mockRejectedValue(error)

        await action.perform()
        
        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).toBeCalledWith(artifacts, url)
        
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
                getByTag: getMock,
                update: updateMock,
                uploadArtifact: uploadMock
            }
        })

        createMock.mockResolvedValue({
            data: {
                upload_url: url
            }
        })
        getMock.mockResolvedValue({
            data: {
                id: id
            }
        })
        updateMock.mockResolvedValue({
            data: {
                upload_url: url
            }
        })
        uploadMock.mockResolvedValue({})

        const MockInputs = jest.fn<Inputs, any>(() => {
            return {
                allowUpdates: allowUpdates,
                artifacts: inputArtifact,
                body: body,
                commit: commit,
                draft: draft,
                name: name,
                tag: tag,
                token: token,
                readArtifact: () => artifactData
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