import type { CacheKeyOptions, TransformedSource, Transformer, TransformOptions } from '@jest/transform';
import type { Config } from '@jest/types';
import type { Logger } from 'bs-logger';
import { ConfigSet } from './config/config-set';
export declare class TsJestTransformer implements Transformer {
    protected readonly logger: Logger;
    protected _transformCfgStr: string;
    constructor();
    configsFor(jestConfig: Config.ProjectConfig): ConfigSet;
    process(input: string, filePath: Config.Path, jestConfig: Config.ProjectConfig, transformOptions?: TransformOptions): TransformedSource | string;
    getCacheKey(fileContent: string, filePath: string, _jestConfigStr: string, transformOptions: CacheKeyOptions): string;
}
