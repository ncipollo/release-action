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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const action = createAction();
            yield action.perform();
        }
        catch (error) {
            const errorMessage = new ErrorMessage_1.ErrorMessage(error);
            core.setFailed(errorMessage.toString());
        }
    });
}
function createAction() {
    const token = core.getInput('token');
    const context = github.context;
    const git = new github.GitHub(token);
    const globber = new ArtifactGlobber_1.FileArtifactGlobber();
    const inputs = new Inputs_1.CoreInputs(globber, context);
    const releases = new Releases_1.GithubReleases(context, git);
    const uploader = new ArtifactUploader_1.GithubArtifactUploader(releases);
    return new Action_1.Action(inputs, releases, uploader);
}
run();
