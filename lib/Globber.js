"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
class FileGlobber {
    glob(pattern) {
        return new glob_1.GlobSync(pattern, { mark: true }).found;
    }
}
exports.FileGlobber = FileGlobber;
