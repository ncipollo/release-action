"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Artifact = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
class Artifact {
    constructor(path, contentType = "raw") {
        this.path = path;
        this.name = path_1.basename(path);
        this.contentType = contentType;
    }
    get contentLength() {
        return fs_1.statSync(this.path).size;
    }
    readFile() {
        return fs_1.readFileSync(this.path);
    }
}
exports.Artifact = Artifact;
