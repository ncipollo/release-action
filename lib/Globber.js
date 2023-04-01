"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGlobber = void 0;
const glob_1 = require("glob");
class FileGlobber {
    glob(pattern) {
        return (0, glob_1.globSync)(pattern, { mark: true });
    }
}
exports.FileGlobber = FileGlobber;
