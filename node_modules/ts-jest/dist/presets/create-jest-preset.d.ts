import type { Config } from '@jest/types';
import type { TsJestPresets } from '../types';
interface CreateJestPresetOptions {
    allowJs?: boolean;
}
export declare function createJestPreset({ allowJs }?: CreateJestPresetOptions, from?: Config.InitialOptions): TsJestPresets;
export {};
