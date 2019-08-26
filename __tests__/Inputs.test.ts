const mockGetInput = jest.fn();
const mockReadFileSync = jest.fn();
const mockStatSync = jest.fn();

import { Inputs } from "../src/Inputs";
import { Context } from "@actions/github/lib/context";


jest.mock('@actions/core', () => {
    return { getInput: mockGetInput };
});

jest.mock('fs', () => {
    return { 
        readFileSync: mockReadFileSync,
        statSync: mockStatSync
     };
});

describe('Inputs', () => {
    let context: Context;
    let inputs: Inputs;
    beforeEach(() => {
        mockGetInput.mockReturnValue(null)
        context = new Context()
        inputs = new Inputs(context)
    })

    it('returns artifact', () => {
        mockGetInput.mockReturnValue("a/path")
        expect(inputs.artifact).toBe("a/path")
    })

    it('returns artifactContentLength', () => {
        mockGetInput.mockReturnValue("a/path")
        mockStatSync.mockReturnValue({size: 100})
        expect(inputs.artifactContentLength).toBe(100)
    })

    it('returns targetCommit', () => {
        mockGetInput.mockReturnValue("42")
        expect(inputs.commit).toBe("42")
    })

    it('returns token', () => {
        mockGetInput.mockReturnValue("42")
        expect(inputs.token).toBe("42")
    })

    describe('artifactContentType', () => {
        it('returns input content-type', () => {
            mockGetInput.mockReturnValue("type")
            expect(inputs.artifactContentType).toBe("type")
        })

        it('returns raw as default', () => {
            expect(inputs.artifactContentType).toBe("raw")
        })
    })

    describe('description', () => {
        it('returns input description', () => {
            mockGetInput.mockReturnValue("description")
            expect(inputs.description).toBe("description")
        })

        it('returns description file contents', () => {
            mockGetInput.mockReturnValueOnce("").mockReturnValueOnce("a/path")
            mockReadFileSync.mockReturnValue("file")

            expect(inputs.description).toBe("file")
        })

        it('returns empty', () => {
            expect(inputs.description).toBe("")
        })
    })

    describe('name', () => {
        it('returns input name', () => {
            mockGetInput.mockReturnValue("name")
            expect(inputs.name).toBe("name")
        })

        it('returns tag', () => {
            mockGetInput.mockReturnValue("")
            context.ref = "refs/tags/sha-tag"
            expect(inputs.name).toBe("sha-tag")
        })
    })

    describe('tag', () => {
        it('returns input tag', () => {
            mockGetInput.mockReturnValue("tag")
            expect(inputs.tag).toBe("tag")
        })
        it('returns context sha when input is empty', () => {
            mockGetInput.mockReturnValue("")
            context.ref = "refs/tags/sha-tag"
            expect(inputs.tag).toBe("sha-tag")
        })
        it('returns context sha when input is null', () => {
            mockGetInput.mockReturnValue(null)
            context.ref = "refs/tags/sha-tag"
            expect(inputs.tag).toBe("sha-tag")
        })
        it('throws if no tag', () => {
            expect(() => inputs.tag).toThrow()
        })
    })
})