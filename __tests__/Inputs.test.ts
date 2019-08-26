const mockGetInput = jest.fn();

import { Inputs } from "../src/Inputs";
import { Context } from "@actions/github/lib/context";


jest.mock('@actions/core', () => {
    return {getInput: mockGetInput};
});

describe('Inputs', () => {
    let context: Context
    let inputs: Inputs
    beforeEach(() => {
        context = new Context()
        inputs = new Inputs(context)
        mockGetInput.mockReturnValue("")
    })
    it('returns token', () => {
        mockGetInput.mockReturnValue("42")
        expect(inputs.token).toBe("42")
    })
})