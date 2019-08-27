"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Action {
    constructor(inputs, releases) {
        this.inputs = inputs;
        this.releases = releases;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const createResult = yield this.releases.create(this.inputs.tag, this.inputs.body, this.inputs.commit, this.inputs.draft, this.inputs.name);
            if (this.inputs.artifact) {
                const artifactData = this.inputs.readArtifact();
                yield this.releases.uploadArtifact(createResult.data.upload_url, this.inputs.artifactContentLength, this.inputs.artifactContentType, artifactData, this.inputs.artifactName);
            }
        });
    }
}
exports.Action = Action;
