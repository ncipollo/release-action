import { ErrorMessage } from "../src/ErrorMessage"

describe('ErrorMessage', () => {

    describe('has error with code', () => {
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
            ],
            status: 422
        }

        it('does not have error', () => {
            const errorMessage = new ErrorMessage(error)
            expect(errorMessage.hasErrorWithCode('missing_field')).toBeFalsy()
        })

        it('has error', () => {
            const errorMessage = new ErrorMessage(error)
            expect(errorMessage.hasErrorWithCode('missing')).toBeTruthy()
        })
    })

    it('generates message with errors', () => {
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
            ],
            status: 422
        }

        const errorMessage = new ErrorMessage(error)

        const expectedString = "Error 422: something bad happened\nErrors:\n- release does not exist.\n- release already exists."
        expect(errorMessage.toString()).toBe(expectedString)
    })

    it('generates message without errors', () => {
        const error = {
            message: 'something bad happened',
            status: 422
        }

        const errorMessage = new ErrorMessage(error)

        expect(errorMessage.toString()).toBe('Error 422: something bad happened')
    })

    it('provides error status', () => {
        const error = { status: 404 }
        const errorMessage = new ErrorMessage(error)
        expect(errorMessage.status).toBe(404)
    })
})
