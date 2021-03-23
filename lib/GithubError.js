"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubError = void 0;
const GithubErrorDetail_1 = require("./GithubErrorDetail");
class GithubError {
    constructor(error) {
        this.error = error;
        this.githubErrors = this.generateGithubErrors();
    }
    generateGithubErrors() {
        const errors = this.error.errors;
        if (errors instanceof Array) {
            return errors.map((err) => new GithubErrorDetail_1.GithubErrorDetail(err));
        }
        else {
            return [];
        }
    }
    get status() {
        return this.error.status;
    }
    hasErrorWithCode(code) {
        return this.githubErrors.some((err) => err.code == code);
    }
    toString() {
        const message = this.error.message;
        const errors = this.githubErrors;
        const status = this.status;
        if (errors.length > 0) {
            return `Error ${status}: ${message}\nErrors:\n${this.errorBulletedList(errors)}`;
        }
        else {
            return `Error ${status}: ${message}`;
        }
    }
    errorBulletedList(errors) {
        return errors.map((err) => `- ${err}`).join("\n");
    }
}
exports.GithubError = GithubError;
