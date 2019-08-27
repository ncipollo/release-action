import { Action } from "../src/Action";
import { Inputs } from "../src/Inputs";
import { Releases } from "../src/Releases";

const createMock = jest.fn()
const uploadMock = jest.fn()

const artifactPath = 'a/path'
const artifactName = 'path'
const artifactData = Buffer.from('blob','utf-8')
const body = 'body'
const commit = 'commit'
const contentType = "raw"
const contentLength = 100
const draft = true
const name = 'name'
const tag = 'tag'
const token = 'token'
const url = 'http://api.example.com'

describe("Action", () => {
    beforeEach(() => {
        createMock.mockClear()
        uploadMock.mockClear()
    })

    it('creates release but does not upload if no artifact', async () => {
        const action = createAction(false)

        await action.perform()

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).not.toBeCalled()
    })

    it('creates release then uploads artifact', async () => {
        const action = createAction(true)
        createMock.mockResolvedValue({
            data: {
                upload_url: url
            }
        })

        await action.perform()

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).toBeCalledWith(url, contentLength, contentType, artifactData, 'path')
    })

    it('throws error when create fails', async () => {
        const action = createAction(true)
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

    it('throws error when upload fails', async () => {
        const action = createAction(true)
        createMock.mockResolvedValue({
            data: {
                upload_url: url
            }
        })
        uploadMock.mockRejectedValue("error")

        expect.hasAssertions()
        try {
            await action.perform()
        } catch (error) {
            expect(error).toEqual("error")
        }

        expect(createMock).toBeCalledWith(tag, body, commit, draft, name)
        expect(uploadMock).toBeCalledWith(url, contentLength, contentType, artifactData, 'path')
    })

    function createAction(hasArtifact: boolean): Action {
        let artifact: string
        if (hasArtifact) {
            artifact = artifactPath
        } else {
            artifact = ''
        }
        const MockReleases = jest.fn<Releases, any>(() => {
            return {
                create: createMock,
                uploadArtifact: uploadMock
            }
        })
        const MockInputs = jest.fn<Inputs, any>(() => {
            return {
                artifact: artifact,
                artifactName: artifactName,
                artifactContentType: contentType,
                artifactContentLength: contentLength,
                body: body,
                commit: commit,
                draft: draft,
                name: name,
                tag: tag,
                token: token,
                readArtifact: () => artifactData
            }
        })
        const inputs = new MockInputs()
        const releases = new MockReleases()

        return new Action(inputs, releases)
    }
})