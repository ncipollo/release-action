"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GithubError_1 = require("./GithubError");
class ErrorMessage {
    constructor(error) {
        this.error = error;
        this.githubErrors = this.generateGithubErrors();
    }
    generateGithubErrors() {
        const errors = this.error.errors;
        if (errors instanceof Array) {
            return errors.map((err) => new GithubError_1.GithubError(err));
        }
        else {
            return [];
        }
    }
    hasErrorWithCode(code) {
        return this.githubErrors.some((err) => err.code == code);
    }
    toString() {
        const message = this.error.message;
        const errors = this.githubErrors;
        if (errors.length > 0) {
            return `${message}\nErrors:\n${this.errorBulletedList(errors)}`;
        }
        else {
            return message;
        }
    }
    errorBulletedList(errors) {
        return errors.map((err) => `- ${err}`).join("\n");
    }
}
exports.ErrorMessage = ErrorMessage;
