import { ErrorMessage } from "../src/ErrorMessage"

describe('ErrorMessage', () => {
    it('generates message with errors', () => {
        const resource = "release"
        const error = {
            message: 'something bad happened',
            errors: [
                {
                    code: 'missing',
                    resource: 'release'
                },
                {
                    code: 'already_exists',
                    resource: 'release'
                }
            ]
        }

        const errorMessage = new ErrorMessage(error)

        const expectedString = "something bad happened\nErrors:\n- release does not exist.\n- release already exists."
        expect(errorMessage.toString()).toBe(expectedString)
    })

    it('generates message without errors', () => {
        const error = {
            message: 'something bad happened'
        }

        const errorMessage = new ErrorMessage(error)

        expect(errorMessage.toString()).toBe('something bad happened')
    })
})