import { FileArtifactGlobber } from "../src/ArtifactGlobber"
import { Globber } from "../src/Globber";
import { Artifact } from "../src/Artifact";

const contentType = "raw"
const globResults = ["file1", "file2"]

describe("ArtifactGlobber", () => {
    it("globs simple path", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts =
            globResults.map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString('path', 'raw'))
            .toEqual(expectedArtifacts)
    })

    it("splits multiple paths", () => {
        const globber = createArtifactGlobber()

        const expectedArtifacts =
            globResults
                .concat(globResults)
                .map((path) => new Artifact(path, contentType))

        expect(globber.globArtifactString('path1,path2', 'raw'))
            .toEqual(expectedArtifacts)
    })

    function createArtifactGlobber(): FileArtifactGlobber {
        const MockGlobber = jest.fn<Globber, any>(() => {
            return {
                glob: () => globResults
            }
        })
        return new FileArtifactGlobber(new MockGlobber())
    }
})