export * from './repeat';
export * from './repeat-end';
export * from './base';
export * from './ordinal';

import { RepeatMode, RepeatConfig } from './repeat';
import { RepeatEndMode } from './repeat-end';

export interface Repeat {
  /** 重复模式 */
  repeatMode: RepeatMode;

  /** 重复配置 */
  repeatConfig?: RepeatConfig;

  /** 重复结束模式 */
  repeatEndMode: RepeatEndMode;

  /** 重复结束日期 */
  repeatEndDate?: string;

  /** 重复次数 */
  repeatTimes?: number;
}
