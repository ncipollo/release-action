import type * as _ts from 'typescript';
import type { ConfigSet } from '../config/config-set';
export declare function factory(cs: ConfigSet): (ctx: _ts.TransformationContext) => _ts.Transformer<_ts.SourceFile>;
