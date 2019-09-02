import { Action } from "../src/Action";
import { Artifact } from "../src/Artifact";
import { Inputs } from "../src/Inputs";
import { Releases } from "../src/Releases";
import { ArtifactUploader } from "../src/ArtifactUploader";

const createMock = jest.fn()
const uploadMock = jest.fn()

const artifacts = [
    new Artifact('a/art1'),
    new Artifact('b/art2')
]
const artifactData = Buffer.from('blob', 'utf-8')
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
        expect(uploadMock).toBeCalledWith(artifacts, url)
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
        expect(uploadMock).toBeCalledWith(artifacts, url)
    })

    function createAction(hasArtifact: boolean): Action {
        let inputArtifact: Artifact[]
        if (hasArtifact) {
            inputArtifact = artifacts
        } else {
            inputArtifact = []
        }
        const MockReleases = jest.fn<Releases, any>(() => {
            return {
                create: createMock,
                uploadArtifact: jest.fn()
            }
        })
        const MockInputs = jest.fn<Inputs, any>(() => {
            return {
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