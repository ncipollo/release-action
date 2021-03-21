"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompilerInstance = exports.updateOutput = exports.SOURCE_MAPPING_PREFIX = void 0;
var language_service_1 = require("./language-service");
var transpiler_1 = require("./transpiler");
var json_1 = require("../utils/json");
exports.SOURCE_MAPPING_PREFIX = 'sourceMappingURL=';
function updateOutput(outputText, normalizedFileName, sourceMap) {
    var base64Map = Buffer.from(updateSourceMap(sourceMap, normalizedFileName), 'utf8').toString('base64');
    var sourceMapContent = "data:application/json;charset=utf-8;base64," + base64Map;
    return (outputText.slice(0, outputText.lastIndexOf(exports.SOURCE_MAPPING_PREFIX) + exports.SOURCE_MAPPING_PREFIX.length) + sourceMapContent);
}
exports.updateOutput = updateOutput;
var updateSourceMap = function (sourceMapText, normalizedFileName) {
    var sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = normalizedFileName;
    sourceMap.sources = [normalizedFileName];
    delete sourceMap.sourceRoot;
    return json_1.stringify(sourceMap);
};
var compileAndUpdateOutput = function (compileFn, logger) { return function (code, fileName, lineOffset) {
    logger.debug({ fileName: fileName }, 'compileAndUpdateOutput(): get compile output');
    var _a = __read(compileFn(code, fileName, lineOffset), 2), value = _a[0], sourceMap = _a[1];
    return updateOutput(value, fileName, sourceMap);
}; };
exports.createCompilerInstance = function (configs) {
    var logger = configs.logger.child({ namespace: 'ts-compiler' });
    var compilerOptions = configs.parsedTsConfig.options;
    var extensions = ['.ts', '.tsx'];
    if (compilerOptions.allowJs) {
        extensions.push('.js');
        extensions.push('.jsx');
    }
    var compilerInstance = !configs.isolatedModules
        ? language_service_1.initializeLanguageServiceInstance(configs, logger)
        : transpiler_1.initializeTranspilerInstance(configs, logger);
    var compile = compileAndUpdateOutput(compilerInstance.compileFn, logger);
    return { cwd: configs.cwd, compile: compile, program: compilerInstance.program };
};
