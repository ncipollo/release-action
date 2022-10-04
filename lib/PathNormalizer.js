"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathNormalizer = void 0;
const path_1 = __importDefault(require("path"));
class PathNormalizer {
    static normalizePath(pathString) {
        return pathString.split(path_1.default.sep).join("/");
    }
}
exports.PathNormalizer = PathNormalizer;
