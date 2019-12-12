import { GithubError } from "./GithubError"

export class ErrorMessage {
    private error: any
    private githubErrors: GithubError[]

    constructor(error: any) {
        this.error = error
        this.githubErrors = this.generateGithubErrors()
    }

    private generateGithubErrors(): GithubError[] {
        const errors = this.error.errors
        if (errors instanceof Array) {
            return errors.map((err) => new GithubError(err))
        } else {
            return []
        }
    }

    hasErrorWithCode(code: String): boolean {
        return this.githubErrors.some((err) => err.code == code)
    }

    toString(): string {
        const message = this.error.message
        const errors = this.githubErrors
        if (errors.length > 0) {
            return `${message}\nErrors:\n${this.errorBulletedList(errors)}`
        } else {
            return message
        }
    }

    private errorBulletedList(errors: GithubError[]): string {
        return errors.map((err) => `- ${err}`).join("\n")
    }
}

