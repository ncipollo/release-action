import * as fs from "node:fs"
import * as core from "@actions/core"
import type * as github from "@actions/github"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@actions/core")
vi.mock("fs")

import { Artifact } from "../src/Artifact.js"
import type { ArtifactGlobber } from "../src/ArtifactGlobber.js"
import { CoreInputs, type Inputs } from "../src/Inputs.js"

const mockGetInput = vi.mocked(core.getInput)
const mockGetBooleanInput = vi.mocked(core.getBooleanInput)
const mockReadFileSync = vi.mocked(fs.readFileSync)
const _mockStatSync = vi.mocked(fs.statSync)
const mockExistsSync = vi.mocked(fs.existsSync)
const mockGlob = vi.fn()

// existsSync is used by Context's constructor
mockExistsSync.mockReturnValue(false)

const artifacts = [new Artifact("a/art1"), new Artifact("b/art2")]

describe("Inputs", () => {
    let context: typeof github.context
    let inputs: Inputs
    beforeEach(() => {
        mockGetInput.mockReset()
        mockGlob.mockClear()
        context = {
            payload: {},
            eventName: "",
            sha: "",
            ref: "",
            workflow: "",
            action: "",
            actor: "",
            job: "",
            runNumber: 0,
            runId: 0,
            runAttempt: 0,
            apiUrl: "",
            serverUrl: "",
            graphqlUrl: "",
            get repo() {
                const repo = process.env.GITHUB_REPOSITORY || "/"
                const [owner, repoName] = repo.split("/")
                return { owner: owner || "", repo: repoName || "" }
            },
            issue: { owner: "", repo: "", number: 0 },
            // biome-ignore lint/suspicious/noExplicitAny: Partial Context object for testing
        } as any
        inputs = new CoreInputs(createGlobber(), context)
    })

    describe("commit", () => {
        it("returns commit", () => {
            mockGetInput.mockReturnValueOnce("commit")
            expect(inputs.commit).toBe("commit")
        })

        it("returns undefined when omitted", () => {
            mockGetInput.mockReturnValueOnce("")
            expect(inputs.commit).toBeUndefined()
        })
    })

    it("returns token", () => {
        mockGetInput.mockReturnValue("42")
        expect(inputs.token).toBe("42")
    })

    describe("allowsUpdates", () => {
        it("returns false", () => {
            expect(inputs.allowUpdates).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.allowUpdates).toBe(true)
        })
    })

    describe("artifactErrorsFailBuild", () => {
        it("returns false", () => {
            expect(inputs.artifactErrorsFailBuild).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.artifactErrorsFailBuild).toBe(true)
        })
    })

    describe("artifacts", () => {
        it("globber told to throw errors", () => {
            mockGetInput.mockReturnValueOnce("art1").mockReturnValueOnce("contentType").mockReturnValueOnce("true")

            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toHaveBeenCalledTimes(1)
            expect(mockGlob).toHaveBeenCalledWith("art1", "contentType", true)
        })

        it("returns empty artifacts", () => {
            mockGetInput.mockReturnValueOnce("").mockReturnValueOnce("")

            expect(inputs.artifacts).toEqual([])
            expect(mockGlob).toHaveBeenCalledTimes(0)
        })

        it("returns input.artifacts", () => {
            mockGetInput.mockReturnValueOnce("art1").mockReturnValueOnce("contentType").mockReturnValueOnce("false")

            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toHaveBeenCalledTimes(1)
            expect(mockGlob).toHaveBeenCalledWith("art1", "contentType", false)
        })

        it("returns input.artifacts with default contentType", () => {
            mockGetInput.mockReturnValueOnce("art1").mockReturnValueOnce("").mockReturnValueOnce("false")

            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toHaveBeenCalledTimes(1)
            expect(mockGlob).toHaveBeenCalledWith("art1", "raw", false)
        })

        it("returns input.artifact", () => {
            mockGetInput
                .mockReturnValueOnce("")
                .mockReturnValueOnce("art2")
                .mockReturnValueOnce("contentType")
                .mockReturnValueOnce("false")

            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toHaveBeenCalledTimes(1)
            expect(mockGlob).toHaveBeenCalledWith("art2", "contentType", false)
        })
    })

    describe("createdDraft", () => {
        it("returns false", () => {
            expect(inputs.createdDraft).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.createdDraft).toBe(true)
        })
    })

    describe("createdReleaseBody", () => {
        it("returns input body", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("body")
            expect(inputs.createdReleaseBody).toBe("body")
        })

        it("returns body file contents", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("").mockReturnValueOnce("a/path")
            mockReadFileSync.mockReturnValue("file")

            expect(inputs.createdReleaseBody).toBe("file")
        })

        it("returns empty", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("").mockReturnValueOnce("")
            expect(inputs.createdReleaseBody).toBe("")
        })

        it("returns undefined when omitted", () => {
            mockGetInput.mockReturnValueOnce("true").mockReturnValueOnce("body")
            expect(inputs.createdReleaseBody).toBeUndefined()
        })
    })

    describe("createdReleaseName", () => {
        it("returns input name", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("name")
            expect(inputs.createdReleaseName).toBe("name")
        })

        it("returns undefined when omitted", () => {
            mockGetInput.mockReturnValueOnce("true").mockReturnValueOnce("name")
            expect(inputs.createdReleaseName).toBeUndefined()
        })

        it("returns tag", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("")
            context.ref = "refs/tags/sha-tag"
            expect(inputs.createdReleaseName).toBe("sha-tag")
        })
    })

    describe("discussionCategory", () => {
        it("returns category", () => {
            mockGetInput.mockReturnValue("Release")
            expect(inputs.discussionCategory).toBe("Release")
        })

        it("returns undefined", () => {
            mockGetInput.mockReturnValue("")
            expect(inputs.discussionCategory).toBe(undefined)
        })
    })

    describe("generateReleaseNotes", () => {
        it("returns returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.generateReleaseNotes).toBe(true)
        })

        it("returns false when omitted", () => {
            mockGetInput.mockReturnValue("")
            expect(inputs.generateReleaseNotes).toBe(false)
        })
    })

    describe("generateReleaseNotesPreviousTag", () => {
        it("returns the previous tag when provided", () => {
            mockGetInput.mockReturnValue("v1.0.0")
            expect(inputs.generateReleaseNotesPreviousTag).toBe("v1.0.0")
        })

        it("returns undefined when omitted", () => {
            mockGetInput.mockReturnValue("")
            expect(inputs.generateReleaseNotesPreviousTag).toBeUndefined()
        })
    })

    describe("immutableCreate", () => {
        it("returns false by default", () => {
            mockGetInput.mockReturnValue("")
            expect(inputs.immutableCreate).toBe(false)
        })

        it("returns true when explicitly set", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.immutableCreate).toBe(true)
        })

        it("returns false when explicitly disabled", () => {
            mockGetInput.mockReturnValue("false")
            expect(inputs.immutableCreate).toBe(false)
        })
    })

    describe("makeLatest", () => {
        it("returns legacy", () => {
            mockGetInput.mockReturnValueOnce("legacy")
            expect(inputs.makeLatest).toBe("legacy")
        })

        it("returns false", () => {
            mockGetInput.mockReturnValueOnce("false")
            expect(inputs.makeLatest).toBe("false")
        })

        it("returns true", () => {
            mockGetInput.mockReturnValueOnce("true")
            expect(inputs.makeLatest).toBe("true")
        })

        it("returns undefined", () => {
            mockGetInput.mockReturnValueOnce("something_else")
            expect(inputs.makeLatest).toBe(undefined)
        })
    })

    describe("owner", () => {
        it("returns owner from context", () => {
            process.env.GITHUB_REPOSITORY = "owner/repo"
            mockGetInput.mockReturnValue("")
            expect(inputs.owner).toBe("owner")
        })
        it("returns owner from inputs", () => {
            mockGetInput.mockReturnValue("owner")
            expect(inputs.owner).toBe("owner")
        })
    })

    describe("createdPrerelase", () => {
        it("returns false", () => {
            expect(inputs.createdPrerelease).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.createdPrerelease).toBe(true)
        })
    })

    describe("replacesArtifacts", () => {
        it("returns false", () => {
            expect(inputs.replacesArtifacts).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.replacesArtifacts).toBe(true)
        })
    })

    describe("removeArtifacts", () => {
        it("returns false", () => {
            expect(inputs.removeArtifacts).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValue("true")
            expect(inputs.removeArtifacts).toBe(true)
        })
    })

    describe("repo", () => {
        it("returns repo from context", () => {
            process.env.GITHUB_REPOSITORY = "owner/repo"
            mockGetInput.mockReturnValue("")
            expect(inputs.repo).toBe("repo")
        })
        it("returns repo from inputs", () => {
            mockGetInput.mockReturnValue("repo")
            expect(inputs.repo).toBe("repo")
        })
    })

    describe("skipIfReleaseExists", () => {
        it("returns false", () => {
            mockGetBooleanInput.mockReturnValue(false)
            expect(inputs.skipIfReleaseExists).toBe(false)
        })

        it("returns true", () => {
            mockGetBooleanInput.mockReturnValue(true)
            expect(inputs.skipIfReleaseExists).toBe(true)
        })
    })

    describe("tag", () => {
        it("returns input tag", () => {
            mockGetInput.mockReturnValue("tag")
            expect(inputs.tag).toBe("tag")
        })
        it("returns context sha when input is empty", () => {
            mockGetInput.mockReturnValue("")
            context.ref = "refs/tags/sha-tag"
            expect(inputs.tag).toBe("sha-tag")
        })
        it("throws if no tag", () => {
            context.ref = ""
            expect(() => inputs.tag).toThrow()
        })
    })

    describe("updatedDraft", () => {
        it("returns false", () => {
            expect(inputs.updatedDraft).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValue("true")
            expect(inputs.updatedDraft).toBe(true)
        })

        it("returns true when omitted is blank", () => {
            mockGetInput.mockReturnValueOnce("").mockReturnValue("true")
            expect(inputs.updatedDraft).toBe(true)
        })

        it("returns undefined when omitted for update", () => {
            mockGetInput.mockReturnValueOnce("true").mockReturnValueOnce("true")
            expect(inputs.updatedDraft).toBeUndefined()
        })
    })

    describe("updatedReleaseBody", () => {
        it("returns input body", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("false").mockReturnValueOnce("body")
            expect(inputs.updatedReleaseBody).toBe("body")
        })

        it("returns body file contents", () => {
            mockGetInput
                .mockReturnValueOnce("false")
                .mockReturnValueOnce("false")
                .mockReturnValueOnce("")
                .mockReturnValueOnce("a/path")
            mockReadFileSync.mockReturnValue("file")

            expect(inputs.updatedReleaseBody).toBe("file")
        })

        it("returns empty", () => {
            mockGetInput
                .mockReturnValueOnce("false")
                .mockReturnValueOnce("false")
                .mockReturnValueOnce("")
                .mockReturnValueOnce("")
            expect(inputs.updatedReleaseBody).toBe("")
        })

        it("returns undefined when omitted", () => {
            mockGetInput.mockReturnValueOnce("true").mockReturnValueOnce("false").mockReturnValueOnce("body")
            expect(inputs.updatedReleaseBody).toBeUndefined()
        })

        it("returns undefined when omitted for update", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("true").mockReturnValueOnce("body")
            expect(inputs.updatedReleaseBody).toBeUndefined()
        })
    })

    describe("updatedReleaseName", () => {
        it("returns input name", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("false").mockReturnValueOnce("name")
            expect(inputs.updatedReleaseName).toBe("name")
        })

        it("returns undefined when omitted", () => {
            mockGetInput.mockReturnValueOnce("true").mockReturnValueOnce("false").mockReturnValueOnce("name")
            expect(inputs.updatedReleaseName).toBeUndefined()
        })

        it("returns undefined when omitted for update", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("true").mockReturnValueOnce("name")
            expect(inputs.updatedReleaseName).toBeUndefined()
        })

        it("returns tag", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("false").mockReturnValueOnce("")
            context.ref = "refs/tags/sha-tag"
            expect(inputs.updatedReleaseName).toBe("sha-tag")
        })
    })

    describe("updatedPrerelease", () => {
        it("returns false", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("false")
            expect(inputs.updatedPrerelease).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValueOnce("false").mockReturnValueOnce("true")
            expect(inputs.updatedPrerelease).toBe(true)
        })

        it("returns undefined when omitted for update", () => {
            mockGetInput.mockReturnValueOnce("true").mockReturnValueOnce("false")
            expect(inputs.updatedPrerelease).toBeUndefined()
        })
    })

    describe("updateOnlyUnreleased", () => {
        it("returns false", () => {
            expect(inputs.updateOnlyUnreleased).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValueOnce("true")
            expect(inputs.updateOnlyUnreleased).toBe(true)
        })
    })

    describe("omitBodyDuringUpdate", () => {
        it("returns false", () => {
            expect(inputs.omitBodyDuringUpdate).toBe(false)
        })

        it("returns true", () => {
            mockGetInput.mockReturnValueOnce("true")
            expect(inputs.omitBodyDuringUpdate).toBe(true)
        })
    })

    function createGlobber(): ArtifactGlobber {
        const MockGlobber = vi.fn<() => ArtifactGlobber>(() => {
            return {
                globArtifactString: mockGlob,
            }
        })
        mockGlob.mockImplementation(() => artifacts)
        return MockGlobber()
    }
})
