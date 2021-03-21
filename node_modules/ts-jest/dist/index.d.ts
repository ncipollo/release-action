import { createJestPreset as createJestPresetCore } from './presets/create-jest-preset';
import { TsJestTransformer } from './ts-jest-transformer';
import type { TsJestGlobalOptions } from './types';
import { mocked as mockedCore } from './utils/testing';
declare module '@jest/types' {
    namespace Config {
        interface ConfigGlobals {
            'ts-jest': TsJestGlobalOptions;
        }
    }
}
export declare const mocked: typeof mockedCore;
export declare const createJestPreset: typeof createJestPresetCore;
export declare const pathsToModuleNameMapper: (mapping: import("typescript").MapLike<string[]>, { prefix }?: {
    prefix: string;
}) => {
    [key: string]: string | string[];
} | undefined;
export declare function createTransformer(): TsJestTransformer;
