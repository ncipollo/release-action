import { Action } from "../src/Action";
import { Inputs } from "../src/Inputs";
import { Releases } from "../src/Releases";


describe("Action", () => {

    it('verifies my sanity', () => {
        
    })
})

function createAction(): Action {
    const MockReleases = jest.fn<Releases, any>(() => {
        return {
            create: jest.fn(),
            uploadArtifact: jest.fn()
        }
    })
    const MockInputs = jest.fn<Inputs, any>(() => {
        return {
            artifact: "foo",
            artifactContentType: "foo",
            artifactContentLength: 22,
            body: "bar",
            commit: "foo",
            name: "name",
            tag: "foo",
            token: "foo"
        }
    })
    const inputs = new MockInputs()
    const releases = new MockReleases()

    return new Action(inputs, releases)
}