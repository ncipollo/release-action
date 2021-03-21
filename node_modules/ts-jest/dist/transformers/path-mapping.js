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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = exports.version = exports.name = void 0;
var bs_logger_1 = require("bs-logger");
var path_1 = require("path");
exports.name = 'path-mapping';
exports.version = 1;
var isBaseDir = function (base, dir) { var _a; return !((_a = path_1.relative(base, dir)) === null || _a === void 0 ? void 0 : _a.startsWith('.')); };
function factory(cs) {
    var _a;
    var logger = cs.logger.child({ namespace: 'ts-path-mapping' });
    var ts = cs.compilerModule;
    var compilerOptions = cs.parsedTsConfig.options;
    var rootDirs = (_a = compilerOptions.rootDirs) === null || _a === void 0 ? void 0 : _a.filter(path_1.isAbsolute);
    var isDynamicImport = function (node) {
        return ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword;
    };
    var isRequire = function (node) {
        return ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'require' &&
            ts.isStringLiteral(node.arguments[0]) &&
            node.arguments.length === 1;
    };
    var createVisitor = function (ctx, sf) {
        var fileName = sf.fileName;
        var fileDir = path_1.normalize(path_1.dirname(fileName));
        var rewritePath = function (importPath) {
            var e_1, _a;
            var p = importPath;
            var resolvedModule = ts.resolveModuleName(importPath, fileName, compilerOptions, ts.sys).resolvedModule;
            if (resolvedModule) {
                var resolvedFileName = resolvedModule.resolvedFileName;
                var filePath = fileDir;
                var modulePath = path_1.dirname(resolvedFileName);
                if (rootDirs) {
                    var fileRootDir = '';
                    var moduleRootDir = '';
                    try {
                        for (var rootDirs_1 = __values(rootDirs), rootDirs_1_1 = rootDirs_1.next(); !rootDirs_1_1.done; rootDirs_1_1 = rootDirs_1.next()) {
                            var rootDir = rootDirs_1_1.value;
                            if (isBaseDir(rootDir, resolvedFileName) && rootDir.length > moduleRootDir.length)
                                moduleRootDir = rootDir;
                            if (isBaseDir(rootDir, fileName) && rootDir.length > fileRootDir.length)
                                fileRootDir = rootDir;
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (rootDirs_1_1 && !rootDirs_1_1.done && (_a = rootDirs_1.return)) _a.call(rootDirs_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    if (fileRootDir && moduleRootDir) {
                        filePath = path_1.relative(fileRootDir, filePath);
                        modulePath = path_1.relative(moduleRootDir, modulePath);
                    }
                }
                p = path_1.normalize(path_1.join(path_1.relative(filePath, modulePath), path_1.basename(resolvedFileName)));
                p = p.startsWith('.') ? p : "./" + p;
            }
            return p;
        };
        var visitor = function (node) {
            var rewrittenPath;
            var newNode = ts.getMutableClone(node);
            if (isDynamicImport(node) || isRequire(node)) {
                rewrittenPath = rewritePath(node.arguments[0].text);
                return __assign(__assign({}, newNode), { arguments: ts.createNodeArray([ts.createStringLiteral(rewrittenPath)]) });
            }
            if (ts.isExternalModuleReference(node) && ts.isStringLiteral(node.expression)) {
                rewrittenPath = rewritePath(node.expression.text);
                return ts.updateExternalModuleReference(newNode, ts.createLiteral(rewrittenPath));
            }
            if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
                rewrittenPath = rewritePath(node.moduleSpecifier.text);
                return __assign(__assign({}, newNode), { moduleSpecifier: ts.createLiteral(rewrittenPath) });
            }
            if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                rewrittenPath = rewritePath(node.moduleSpecifier.text);
                return __assign(__assign({}, newNode), { moduleSpecifier: ts.createLiteral(rewrittenPath) });
            }
            if (ts.isImportTypeNode(node) &&
                ts.isLiteralTypeNode(node.argument) &&
                ts.isStringLiteral(node.argument.literal)) {
                rewrittenPath = rewritePath(node.argument.literal.text);
                return __assign(__assign({}, newNode), { argument: ts.createLiteralTypeNode(ts.createStringLiteral(rewrittenPath)) });
            }
            return ts.visitEachChild(node, visitor, ctx);
        };
        return visitor;
    };
    return function (ctx) {
        var _a;
        return logger.wrap((_a = {}, _a[bs_logger_1.LogContexts.logLevel] = bs_logger_1.LogLevels.debug, _a.call = null, _a), 'visitSourceFileNode(): path mapping', function (sf) { return ts.visitNode(sf, createVisitor(ctx, sf)); });
    };
}
exports.factory = factory;
