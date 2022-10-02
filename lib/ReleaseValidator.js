"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseValidator = void 0;
class ReleaseValidator {
    constructor(updateOnlyUnreleased) {
        this.updateOnlyUnreleased = updateOnlyUnreleased;
    }
    validateReleaseUpdate(releaseResponse) {
        var _a;
        if (!this.updateOnlyUnreleased) {
            return;
        }
        if (!releaseResponse.draft && !releaseResponse.prerelease) {
            throw new Error(`Tried to update "${(_a = releaseResponse.name) !== null && _a !== void 0 ? _a : "release"}" which is neither a draft or prerelease. (updateOnlyUnreleased is on)`);
        }
    }
}
exports.ReleaseValidator = ReleaseValidator;
