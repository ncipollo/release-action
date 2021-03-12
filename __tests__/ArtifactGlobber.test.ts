const warnMock = jest.fn()

import { FileArtifactGlobber } from "../src/ArtifactGlobber"
import { Globber } from "../src/Globber";
import { Artifact } from "../src/Artifact";
import untildify = require("untildify");

const contentType = "raw"
const globMock = jest.fn()
const globResults = ["file1", "file2"]

jest.mock('@actions/core', () => {
    return {warning: warnMock};
})

describe("ArtifactGlobber", () => {
    beforeEach(() => {
        globMock.mockClear()
    })

    it("expands paths in which start with a ~", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts =
            globResults.map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString('~/path', 'raw'))
            .toEqual(expectedArtifacts)
        expect(globMock).toBeCalledWith(untildify('~/path'))
        expect(warnMock).not.toBeCalled()
    })
    
    it("globs simple path", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts =
            globResults.map((path) => new Artifact(path, contentType))
        
        expect(globber.globArtifactString('path', 'raw'))
            .toEqual(expectedArtifacts)
        expect(globMock).toBeCalledWith('path')
        expect(warnMock).not.toBeCalled()
    })

    it("splits multiple paths", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts =
            globResults
                .concat(globResults)
                .map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString('path1,path2', 'raw'))
            .toEqual(expectedArtifacts)
        expect(globMock).toBeCalledWith('path1')
        expect(globMock).toBeCalledWith('path2')
        expect(warnMock).not.toBeCalled()
    })

    it("warns when no glob results are produced", () => {
        const globber = createArtifactGlobber([])

        const expectedArtifacts =
            globResults.map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString('path', 'raw'))
            .toEqual([])
        expect(warnMock).toBeCalled()
    })

    function createArtifactGlobber(results: string[] = globResults): FileArtifactGlobber {
        const MockGlobber = jest.fn<Globber, any>(() => {
            return {
                glob: globMock
            }
        })
        globMock.mockReturnValue(results)
        return new FileArtifactGlobber(new MockGlobber())
    }
})