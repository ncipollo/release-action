"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsJestTransformer = void 0;
var config_set_1 = require("./config/config-set");
var constants_1 = require("./constants");
var json_1 = require("./utils/json");
var jsonable_value_1 = require("./utils/jsonable-value");
var logger_1 = require("./utils/logger");
var messages_1 = require("./utils/messages");
var sha1_1 = require("./utils/sha1");
var TsJestTransformer = (function () {
    function TsJestTransformer() {
        this.logger = logger_1.rootLogger.child({ namespace: 'ts-jest-transformer' });
        this.logger.debug('created new transformer');
    }
    TsJestTransformer.prototype.configsFor = function (jestConfig) {
        var ccs = TsJestTransformer._cachedConfigSets.find(function (cs) { return cs.jestConfig.value === jestConfig; });
        var configSet;
        if (ccs) {
            this._transformCfgStr = ccs.transformerCfgStr;
            configSet = ccs.configSet;
        }
        else {
            var serializedJestCfg_1 = json_1.stringify(jestConfig);
            var serializedCcs = TsJestTransformer._cachedConfigSets.find(function (cs) { return cs.jestConfig.serialized === serializedJestCfg_1; });
            if (serializedCcs) {
                serializedCcs.jestConfig.value = jestConfig;
                this._transformCfgStr = serializedCcs.transformerCfgStr;
                configSet = serializedCcs.configSet;
            }
            else {
                this.logger.info('no matching config-set found, creating a new one');
                configSet = new config_set_1.ConfigSet(jestConfig);
                var jest_1 = __assign({}, jestConfig);
                var globals = (jest_1.globals = __assign({}, jest_1.globals));
                jest_1.name = undefined;
                jest_1.cacheDirectory = undefined;
                delete globals['ts-jest'];
                this._transformCfgStr = new jsonable_value_1.JsonableValue(__assign(__assign({ digest: configSet.tsJestDigest, babel: configSet.babelConfig }, jest_1), { tsconfig: {
                        options: configSet.parsedTsConfig.options,
                        raw: configSet.parsedTsConfig.raw,
                    } })).serialized;
                TsJestTransformer._cachedConfigSets.push({
                    jestConfig: new jsonable_value_1.JsonableValue(jestConfig),
                    configSet: configSet,
                    transformerCfgStr: this._transformCfgStr,
                });
            }
        }
        return configSet;
    };
    TsJestTransformer.prototype.process = function (input, filePath, jestConfig, transformOptions) {
        this.logger.debug({ fileName: filePath, transformOptions: transformOptions }, 'processing', filePath);
        var result;
        var source = input;
        var configs = this.configsFor(jestConfig);
        var hooks = configs.hooks;
        var shouldStringifyContent = configs.shouldStringifyContent(filePath);
        var babelJest = shouldStringifyContent ? undefined : configs.babelJestTransformer;
        var isDefinitionFile = filePath.endsWith(constants_1.DECLARATION_TYPE_EXT);
        var isJsFile = constants_1.JS_JSX_REGEX.test(filePath);
        var isTsFile = !isDefinitionFile && constants_1.TS_TSX_REGEX.test(filePath);
        if (shouldStringifyContent) {
            result = "module.exports=" + json_1.stringify(source);
        }
        else if (isDefinitionFile) {
            result = '';
        }
        else if (!configs.parsedTsConfig.options.allowJs && isJsFile) {
            this.logger.warn({ fileName: filePath }, messages_1.interpolate("Got a `.js` file to compile while `allowJs` option is not set to `true` (file: {{path}}). To fix this:\n  - if you want TypeScript to process JS files, set `allowJs` to `true` in your TypeScript config (usually tsconfig.json)\n  - if you do not want TypeScript to process your `.js` files, in your Jest config change the `transform` key which value is `ts-jest` so that it does not match `.js` files anymore", { path: filePath }));
            result = source;
        }
        else if (isJsFile || isTsFile) {
            result = configs.tsCompiler.compile(source, filePath);
        }
        else {
            var message = babelJest ? "Got a unknown file type to compile (file: {{path}}). To fix this, in your Jest config change the `transform` key which value is `ts-jest` so that it does not match this kind of files anymore. If you still want Babel to process it, add another entry to the `transform` option with value `babel-jest` which key matches this type of files." : "Got a unknown file type to compile (file: {{path}}). To fix this, in your Jest config change the `transform` key which value is `ts-jest` so that it does not match this kind of files anymore.";
            this.logger.warn({ fileName: filePath }, messages_1.interpolate(message, { path: filePath }));
            result = source;
        }
        if (babelJest) {
            this.logger.debug({ fileName: filePath }, 'calling babel-jest processor');
            result = babelJest.process(result, filePath, jestConfig, __assign(__assign({}, transformOptions), { instrument: false }));
        }
        if (hooks.afterProcess) {
            this.logger.debug({ fileName: filePath, hookName: 'afterProcess' }, 'calling afterProcess hook');
            var newResult = hooks.afterProcess([input, filePath, jestConfig, transformOptions], result);
            if (newResult !== undefined) {
                return newResult;
            }
        }
        return result;
    };
    TsJestTransformer.prototype.getCacheKey = function (fileContent, filePath, _jestConfigStr, transformOptions) {
        var configs = this.configsFor(transformOptions.config);
        this.logger.debug({ fileName: filePath, transformOptions: transformOptions }, 'computing cache key for', filePath);
        var _a = transformOptions.instrument, instrument = _a === void 0 ? false : _a, _b = transformOptions.rootDir, rootDir = _b === void 0 ? configs.rootDir : _b;
        return sha1_1.sha1(this._transformCfgStr, '\x00', rootDir, '\x00', "instrument:" + (instrument ? 'on' : 'off'), '\x00', fileContent, '\x00', filePath);
    };
    TsJestTransformer._cachedConfigSets = [];
    return TsJestTransformer;
}());
exports.TsJestTransformer = TsJestTransformer;
