"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const Inputs_1 = require("./Inputs");
const Releases_1 = require("./Releases");
const Action_1 = require("./Action");
const ArtifactUploader_1 = require("./ArtifactUploader");
const ArtifactGlobber_1 = require("./ArtifactGlobber");
const ErrorMessage_1 = require("./ErrorMessage");
async function run() {
    try {
        const action = createAction();
        await action.perform();
    }
    catch (error) {
        const errorMessage = new ErrorMessage_1.ErrorMessage(error);
        core.setFailed(errorMessage.toString());
    }
}
function createAction() {
    const token = core.getInput('token');
    const context = github.context;
    const git = new github.GitHub(token);
    const globber = new ArtifactGlobber_1.FileArtifactGlobber();
    const inputs = new Inputs_1.CoreInputs(globber, context);
    const releases = new Releases_1.GithubReleases(context, git);
    const uploader = new ArtifactUploader_1.GithubArtifactUploader(releases, inputs.replacesArtifacts);
    return new Action_1.Action(inputs, releases, uploader);
}
run();
