const mockGetInput = jest.fn();

import { Inputs } from "../src/Inputs";
import { Context } from "@actions/github/lib/context";


jest.mock('@actions/core', () => {
    return { getInput: mockGetInput };
});

describe('Inputs', () => {
    let context: Context;
    let inputs: Inputs;
    beforeEach(() => {
        context = new Context()
        inputs = new Inputs(context)
    })

    it('token method returns input token', () => {
        mockGetInput.mockReturnValue("42")
        expect(inputs.token).toBe("42")
    })

    describe('tag', () => {
        it('tag property returns input tag', () => {
            mockGetInput.mockReturnValue("tag")
            expect(inputs.tag).toBe("tag")
        })
        it('tag property returns context sha when input is empty', () => {
            mockGetInput.mockReturnValue("")
            context.ref = "refs/tags/sha-tag"
            expect(inputs.tag).toBe("sha-tag")
        })
        it('tag property returns context sha when input is null', () => {
            mockGetInput.mockReturnValue(null)
            context.ref = "refs/tags/sha-tag"
            expect(inputs.tag).toBe("sha-tag")
        })
        it('tag property throws if no tag', () => {
            expect(() => inputs.tag).toThrow()
        })
    })
})