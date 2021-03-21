"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformer = exports.pathsToModuleNameMapper = exports.createJestPreset = exports.mocked = void 0;
var bs_logger_1 = require("bs-logger");
var create_jest_preset_1 = require("./presets/create-jest-preset");
var paths_to_module_name_mapper_1 = require("./config/paths-to-module-name-mapper");
var ts_jest_transformer_1 = require("./ts-jest-transformer");
var logger_1 = require("./utils/logger");
var messages_1 = require("./utils/messages");
var testing_1 = require("./utils/testing");
var version_checkers_1 = require("./utils/version-checkers");
var warn = logger_1.rootLogger.child((_a = {}, _a[bs_logger_1.LogContexts.logLevel] = bs_logger_1.LogLevels.warn, _a));
var helperMoved = function (name, helper) {
    return warn.wrap(messages_1.interpolate("The `{{helper}}` helper has been moved to `ts-jest/utils`. Use `import { {{helper}} } from 'ts-jest/utils'` instead.", { helper: name }), helper);
};
exports.mocked = helperMoved('mocked', testing_1.mocked);
exports.createJestPreset = helperMoved('createJestPreset', create_jest_preset_1.createJestPreset);
exports.pathsToModuleNameMapper = helperMoved('pathsToModuleNameMapper', paths_to_module_name_mapper_1.pathsToModuleNameMapper);
function createTransformer() {
    version_checkers_1.VersionCheckers.jest.warn();
    return new ts_jest_transformer_1.TsJestTransformer();
}
exports.createTransformer = createTransformer;
