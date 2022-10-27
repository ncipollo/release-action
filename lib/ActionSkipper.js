"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseActionSkipper = void 0;
class ReleaseActionSkipper {
    constructor(skipIfReleaseExists, releases, tag) {
        this.skipIfReleaseExists = skipIfReleaseExists;
        this.releases = releases;
        this.tag = tag;
    }
    shouldSkip() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.skipIfReleaseExists) {
                // Bail if skip flag isn't set.
                return false;
            }
            try {
                const getResponse = yield this.releases.getByTag(this.tag);
                return getResponse.data != null;
            }
            catch (error) {
                // There is either no release or something else went wrong. Either way, run the action.
                return false;
            }
        });
    }
}
exports.ReleaseActionSkipper = ReleaseActionSkipper;
