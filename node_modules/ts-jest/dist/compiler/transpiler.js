"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTranspilerInstance = void 0;
exports.initializeTranspilerInstance = function (configs, logger) {
    logger.debug('initializeTranspilerInstance(): create typescript compiler');
    var options = configs.parsedTsConfig.options;
    var ts = configs.compilerModule;
    return {
        compileFn: function (code, fileName) {
            logger.debug({ fileName: fileName }, 'compileFn(): compiling as isolated module');
            var result = ts.transpileModule(code, {
                fileName: fileName,
                transformers: configs.customTransformers,
                compilerOptions: options,
                reportDiagnostics: configs.shouldReportDiagnostics(fileName),
            });
            if (result.diagnostics && configs.shouldReportDiagnostics(fileName)) {
                configs.raiseDiagnostics(result.diagnostics, fileName, logger);
            }
            return [result.outputText, result.sourceMapText];
        },
        program: undefined,
    };
};
