"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const path_1 = require("path");
class CoreInputs {
    constructor(context) {
        this.context = context;
    }
    get artifact() {
        return core.getInput('artifact');
    }
    get artifactName() {
        return path_1.basename(this.artifact);
    }
    get artifactContentType() {
        const type = core.getInput('artifactContentType');
        if (type) {
            return type;
        }
        return 'raw';
    }
    get artifactContentLength() {
        return fs_1.statSync(this.artifact).size;
    }
    get body() {
        const body = core.getInput('body');
        if (body) {
            return body;
        }
        const bodyFile = core.getInput('bodyFile');
        if (bodyFile) {
            return this.stringFromFile(bodyFile);
        }
        return '';
    }
    get commit() {
        return core.getInput('commit');
    }
    get draft() {
        const draft = core.getInput('draft');
        return draft == 'true';
    }
    get name() {
        const name = core.getInput('name');
        if (name) {
            return name;
        }
        return this.tag;
    }
    get tag() {
        const tag = core.getInput('tag');
        if (tag) {
            return tag;
        }
        const ref = this.context.ref;
        const tagPath = "refs/tags/";
        if (ref && ref.startsWith(tagPath)) {
            return ref.substr(tagPath.length, ref.length);
        }
        throw Error("No tag found in ref or input!");
    }
    get token() {
        return core.getInput('token', { required: true });
    }
    readArtifact() {
        return fs_1.readFileSync(this.artifact);
    }
    stringFromFile(path) {
        return fs_1.readFileSync(path, 'utf-8');
    }
}
exports.CoreInputs = CoreInputs;
