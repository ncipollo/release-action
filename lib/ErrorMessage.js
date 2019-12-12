"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GithubError_1 = require("./GithubError");
class ErrorMessage {
    constructor(error) {
        this.error = error;
    }
    toString() {
        const message = this.error.message;
        const errors = this.githubErrors();
        if (errors.length > 0) {
            return `${message}\nErrors:\n${this.errorBulletedList(errors)}`;
        }
        else {
            return message;
        }
    }
    githubErrors() {
        const errors = this.error.errors;
        if (errors instanceof Array) {
            return errors.map((err) => new GithubError_1.GithubError(err));
        }
        else {
            return [];
        }
    }
    errorBulletedList(errors) {
        return errors.map((err) => `- ${err}`).join("\n");
    }
}
exports.ErrorMessage = ErrorMessage;
