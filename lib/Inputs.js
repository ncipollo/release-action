"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreInputs = void 0;
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
class CoreInputs {
    constructor(artifactGlobber, context) {
        this.artifactGlobber = artifactGlobber;
        this.context = context;
    }
    get allowUpdates() {
        const allow = core.getInput('allowUpdates');
        return allow == 'true';
    }
    get artifacts() {
        let artifacts = core.getInput('artifacts');
        if (!artifacts) {
            artifacts = core.getInput('artifact');
        }
        if (artifacts) {
            let contentType = core.getInput('artifactContentType');
            if (!contentType) {
                contentType = 'raw';
            }
            return this.artifactGlobber
                .globArtifactString(artifacts, contentType, this.artifactErrorsFailBuild);
        }
        return [];
    }
    get artifactErrorsFailBuild() {
        const allow = core.getInput('artifactErrorsFailBuild');
        return allow == 'true';
    }
    get createdReleaseBody() {
        if (CoreInputs.omitBody)
            return undefined;
        return this.body;
    }
    static get omitBody() {
        return core.getInput('omitBody') == 'true';
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
    get createdReleaseName() {
        if (CoreInputs.omitName)
            return undefined;
        return this.name;
    }
    get discussionCategory() {
        const category = core.getInput('discussionCategory');
        if (category) {
            return category;
        }
        return undefined;
    }
    static get omitName() {
        return core.getInput('omitName') == 'true';
    }
    get name() {
        const name = core.getInput('name');
        if (name) {
            return name;
        }
        return this.tag;
    }
    get draft() {
        const draft = core.getInput('draft');
        return draft == 'true';
    }
    get owner() {
        let owner = core.getInput('owner');
        if (owner) {
            return owner;
        }
        return this.context.repo.owner;
    }
    get createdPrerelease() {
        const preRelease = core.getInput('prerelease');
        return preRelease == 'true';
    }
    static get omitPrereleaseDuringUpdate() {
        return core.getInput('omitPrereleaseDuringUpdate') == 'true';
    }
    get updatedPrerelease() {
        if (CoreInputs.omitPrereleaseDuringUpdate)
            return undefined;
        return this.createdPrerelease;
    }
    get removeArtifacts() {
        const removes = core.getInput('removeArtifacts');
        return removes == 'true';
    }
    get replacesArtifacts() {
        const replaces = core.getInput('replacesArtifacts');
        return replaces == 'true';
    }
    get repo() {
        let repo = core.getInput('repo');
        if (repo) {
            return repo;
        }
        return this.context.repo.repo;
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
    get updatedReleaseBody() {
        if (CoreInputs.omitBody || CoreInputs.omitBodyDuringUpdate)
            return undefined;
        return this.body;
    }
    static get omitBodyDuringUpdate() {
        return core.getInput('omitBodyDuringUpdate') == 'true';
    }
    get updatedReleaseName() {
        if (CoreInputs.omitName || CoreInputs.omitNameDuringUpdate)
            return undefined;
        return this.name;
    }
    static get omitNameDuringUpdate() {
        return core.getInput('omitNameDuringUpdate') == 'true';
    }
    stringFromFile(path) {
        return fs_1.readFileSync(path, 'utf-8');
    }
}
exports.CoreInputs = CoreInputs;
