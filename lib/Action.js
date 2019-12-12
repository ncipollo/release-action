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
class Action {
    constructor(inputs, releases, uploader) {
        this.inputs = inputs;
        this.releases = releases;
        this.uploader = uploader;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const createResult = yield this.releases.create(this.inputs.tag, this.inputs.body, this.inputs.commit, this.inputs.draft, this.inputs.name);
            const artifacts = this.inputs.artifacts;
            if (artifacts.length > 0) {
                yield this.uploader.uploadArtifacts(artifacts, createResult.data.upload_url);
            }
        });
    }
}
exports.Action = Action;
