const mockGetInput = jest.fn();
const mockGlob = jest.fn()
const mockReadFileSync = jest.fn();
const mockStatSync = jest.fn();

import { Artifact } from "../src/Artifact";
import { ArtifactGlobber } from "../src/ArtifactGlobber";
import { Context } from "@actions/github/lib/context";
import { Inputs, CoreInputs } from "../src/Inputs";

const artifacts = [
    new Artifact('a/art1'),
    new Artifact('b/art2')
]

jest.mock('@actions/core', () => {
    return { getInput: mockGetInput };
})

jest.mock('fs', () => {
    return {
        readFileSync: mockReadFileSync,
        statSync: mockStatSync
    };
})

describe('Inputs', () => {
    let context: Context;
    let inputs: Inputs;
    beforeEach(() => {
        mockGetInput.mockReset()
        context = new Context()
        inputs = new CoreInputs(createGlobber(), context)
    })

    it('returns targetCommit', () => {
        mockGetInput.mockReturnValue('42')
        expect(inputs.commit).toBe('42')
    })

    it('returns token', () => {
        mockGetInput.mockReturnValue('42')
        expect(inputs.token).toBe('42')
    })

    describe('allowsUpdates', () => {
        it('returns false', () => {
            expect(inputs.allowUpdates).toBe(false)
        })

        it('returns true', () => {
            mockGetInput.mockReturnValue('true')
            expect(inputs.allowUpdates).toBe(true)
        })
    })

    describe('artifacts', () => {
        it('returns empty artifacts', () => {
            mockGetInput.mockReturnValueOnce('')
            .mockReturnValueOnce('')
            
            expect(inputs.artifacts).toEqual([])
            expect(mockGlob).toBeCalledTimes(0)
        })

        it('returns input.artifacts', () => {
            mockGetInput.mockReturnValueOnce('art1')
            .mockReturnValueOnce('contentType')
            
            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toBeCalledTimes(1)
            expect(mockGlob).toBeCalledWith('art1', 'contentType')
        })

        it('returns input.artifacts with default contentType', () => {
            mockGetInput.mockReturnValueOnce('art1')
            
            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toBeCalledTimes(1)
            expect(mockGlob).toBeCalledWith('art1', 'raw')
        })
        
        it('returns input.artifact', () => {
            mockGetInput.mockReturnValueOnce('')
            .mockReturnValueOnce('art2')
            .mockReturnValueOnce('contentType')
            
            expect(inputs.artifacts).toEqual(artifacts)
            expect(mockGlob).toBeCalledTimes(1)
            expect(mockGlob).toBeCalledWith('art2', 'contentType')
        })
    })

    describe('body', () => {
        it('returns input body', () => {
            mockGetInput.mockReturnValue('body')
            expect(inputs.body).toBe('body')
        })

        it('returns body file contents', () => {
            mockGetInput.mockReturnValueOnce('').mockReturnValueOnce('a/path')
            mockReadFileSync.mockReturnValue('file')

            expect(inputs.body).toBe('file')
        })

        it('returns empty', () => {
            expect(inputs.body).toBe('')
        })
    })

    describe('draft', () => {
        it('returns false', () => {
            expect(inputs.draft).toBe(false)
        })

        it('returns true', () => {
            mockGetInput.mockReturnValue('true')
            expect(inputs.draft).toBe(true)
        })
    })

    describe('name', () => {
        it('returns input name', () => {
            mockGetInput.mockReturnValue('name')
            expect(inputs.name).toBe('name')
        })

        it('returns tag', () => {
            mockGetInput.mockReturnValue('')
            context.ref = 'refs/tags/sha-tag'
            expect(inputs.name).toBe('sha-tag')
        })
    })

    describe('prerelase', () => {
        it('returns false', () => {
            expect(inputs.prerelease).toBe(false)
        })

        it('returns true', () => {
            mockGetInput.mockReturnValue('true')
            expect(inputs.prerelease).toBe(true)
        })
    })

    describe('replacesArtifacts', () => {
        it('returns false', () => {
            expect(inputs.replacesArtifacts).toBe(false)
        })

        it('returns true', () => {
            mockGetInput.mockReturnValue('true')
            expect(inputs.replacesArtifacts).toBe(true)
        })
    })

    describe('tag', () => {
        it('returns input tag', () => {
            mockGetInput.mockReturnValue('tag')
            expect(inputs.tag).toBe('tag')
        })
        it('returns context sha when input is empty', () => {
            mockGetInput.mockReturnValue('')
            context.ref = 'refs/tags/sha-tag'
            expect(inputs.tag).toBe('sha-tag')
        })
        it('returns context sha when input is null', () => {
            mockGetInput.mockReturnValue(null)
            context.ref = 'refs/tags/sha-tag'
            expect(inputs.tag).toBe('sha-tag')
        })
        it('throws if no tag', () => {
            expect(() => inputs.tag).toThrow()
        })
    })

    function createGlobber(): ArtifactGlobber {
        const MockGlobber = jest.fn<ArtifactGlobber, any>(() => {
            return {
                globArtifactString: mockGlob
            }
        })
        mockGlob.mockImplementation(() => artifacts)
        return new MockGlobber()
    }
})