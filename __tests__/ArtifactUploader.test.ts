import { Artifact } from "../src/Artifact"
import { GithubArtifactUploader } from "../src/ArtifactUploader"
import { Releases } from "../src/Releases";

const artifacts = [
    new Artifact('a/art1'),
    new Artifact('b/art2')
]
const fileContents = Buffer.from('artful facts', 'utf-8')
const contentLength = 42
const uploadMock = jest.fn()
const url = 'http://api.example.com'

jest.mock('fs', () => {
    return {
        readFileSync: () => fileContents,
        statSync: () => { return { size: contentLength } }
    };
})

describe('ArtifactUploader', () => {
    it('uploads artifacts', () => {
        const uploader = createUploader()
        
        uploader.uploadArtifacts(artifacts, url)
        
        expect(uploadMock).toBeCalledTimes(2)
        expect(uploadMock)
            .toBeCalledWith(url, contentLength, 'raw', fileContents, 'art1')
        expect(uploadMock)
            .toBeCalledWith(url, contentLength, 'raw', fileContents, 'art2')
    })

    function createUploader(): GithubArtifactUploader {
        const MockReleases = jest.fn<Releases, any>(() => {
            return {
                create: jest.fn(),
                uploadArtifact: uploadMock
            }
        })
        return new GithubArtifactUploader(new MockReleases())
    }
});