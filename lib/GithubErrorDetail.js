"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubErrorDetail = void 0;
class GithubErrorDetail {
    constructor(error) {
        this.error = error;
    }
    get code() {
        return this.error.code;
    }
    toString() {
        const code = this.error.code;
        switch (code) {
            case 'missing':
                return this.missingResourceMessage();
            case 'missing_field':
                return this.missingFieldMessage();
            case 'invalid':
                return this.invalidFieldMessage();
            case 'already_exists':
                return this.resourceAlreadyExists();
            default:
                return this.customErrorMessage();
        }
    }
    customErrorMessage() {
        const message = this.error.message;
        const documentation = this.error.documentation_url;
        let documentationMessage;
        if (documentation) {
            documentationMessage = `\nPlease see ${documentation}.`;
        }
        else {
            documentationMessage = "";
        }
        return `${message}${documentationMessage}`;
    }
    invalidFieldMessage() {
        const resource = this.error.resource;
        const field = this.error.field;
        return `The ${field} field on ${resource} is an invalid format.`;
    }
    missingResourceMessage() {
        const resource = this.error.resource;
        return `${resource} does not exist.`;
    }
    missingFieldMessage() {
        const resource = this.error.resource;
        const field = this.error.field;
        return `The ${field} field on ${resource} is missing.`;
    }
    resourceAlreadyExists() {
        const resource = this.error.resource;
        return `${resource} already exists.`;
    }
}
exports.GithubErrorDetail = GithubErrorDetail;
