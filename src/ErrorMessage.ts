import { GithubError } from "./GithubError"

export class ErrorMessage {
    error: any

    constructor(error: any) {
        this.error = error
    }

    toString(): string {
        const message = this.error.message
        const errors = this.githubErrors()
        if (errors.length > 0) {
            return `${message}\nErrors:\n${this.errorBulletedList(errors)}`
        } else {
            return message
        }
    }

    githubErrors(): GithubError[] {
        const errors = this.error.errors
        if (errors instanceof Array) {
            return errors.map((err) => new GithubError(err))
        } else {
            return []
        }
    }

    errorBulletedList(errors: GithubError[]): string {
        return errors.map((err) => `- ${err}`).join("\n")
    }
}

