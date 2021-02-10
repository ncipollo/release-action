import {Action} from "../src/Action";
import * as github from "@actions/github";
import {Inputs} from "../src/Inputs";
import {GithubReleases} from "../src/Releases";
import {GithubArtifactUploader} from "../src/ArtifactUploader";
import {Artifact} from "../src/Artifact";
import * as path from "path";

// This test is currently intended to be manually run during development. To run:
// - Make sure you have an environment variable named GITHUB_TOKEN assigned to your token
// - Remove skip from the test below
describe.skip('Integration Test', () => {
    let action: Action

    beforeEach(() => {
        const token = getToken()
        const git = github.getOctokit(token)

        const inputs = getInputs()
        const releases = new GithubReleases(inputs, git)
        const uploader = new GithubArtifactUploader(releases, inputs.replacesArtifacts)
        action = new Action(inputs, releases, uploader)
    })

    it('Performs action', async () => {
        await action.perform()
    })

    function getInputs(): Inputs {
        const artifactPath = path.join(__dirname, 'Integration.test.ts')
        // new
        const MockInputs = jest.fn<Inputs, any>(() => {
            return {
                allowUpdates: true,
                artifacts: [new Artifact(artifactPath)],
                createdReleaseBody: "release body",
                createdReleaseName: "release name",
                commit: "",
                draft: false,
                owner: "ncipollo",
                prerelease: true,
                replacesArtifacts: true,
                repo: "actions-playground",
                tag: "0.0.71",
                token: getToken(),
                updatedReleaseBody: "updated body",
                updatedReleaseName: "updated name"
            }
        })
        return new MockInputs();
    }

    function getToken(): string {
        return process.env.GITHUB_TOKEN ?? ""
    }

})
