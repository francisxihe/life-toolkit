import { RepeatRepository } from './repeat.repository';
import { Repeat } from './repeat.entity';
import {
  assertRepeat,
  calculateNextDate,
  isValidDate,
  RepeatValidationError,
} from '@true-north/components-repeat/helpers';
import type { RepeatConfigPayload } from '@true-north/components-repeat/types';
import { RepeatEndMode, RepeatMode } from '@true-north/components-repeat/types';
import dayjs from 'dayjs';

export type RepeatRuleInput = {
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatEndMode: RepeatEndMode;
  repeatEndDate?: string;
  repeatTimes?: number;
  repeatStartDate: string;
  currentDate?: string;
};

export class RepeatService {
  repeatRepository: RepeatRepository;

  constructor(repeatRepository = new RepeatRepository()) {
    this.repeatRepository = repeatRepository;
  }

  async create(input: RepeatRuleInput): Promise<Repeat> {
    this.assertValidRepeat(input);
    const fixed = this.fixCurrentDate({ ...input });
    const entity = new Repeat();
    entity.repeatMode = fixed.repeatMode;
    entity.repeatConfig = fixed.repeatConfig;
    entity.repeatEndMode = fixed.repeatEndMode;
    entity.repeatEndDate = fixed.repeatEndDate;
    entity.repeatTimes = fixed.repeatTimes;
    entity.repeatStartDate = fixed.repeatStartDate;
    entity.currentDate = fixed.currentDate || fixed.repeatStartDate;
    return this.repeatRepository.create(entity);
  }

  async update(id: string, input: Partial<RepeatRuleInput>): Promise<Repeat> {
    const current = await this.repeatRepository.find(id);
    const next: RepeatRuleInput = {
      repeatMode: input.repeatMode ?? current.repeatMode,
      repeatConfig: input.repeatConfig !== undefined ? input.repeatConfig : current.repeatConfig,
      repeatEndMode: input.repeatEndMode ?? current.repeatEndMode,
      repeatEndDate: input.repeatEndDate !== undefined ? input.repeatEndDate : current.repeatEndDate,
      repeatTimes: input.repeatTimes !== undefined ? input.repeatTimes : current.repeatTimes,
      repeatStartDate: input.repeatStartDate ?? current.repeatStartDate,
      currentDate: input.currentDate !== undefined ? input.currentDate : current.currentDate,
    };
    this.assertValidRepeat(next);
    const fixed = this.fixCurrentDate(next);
    current.repeatMode = fixed.repeatMode;
    current.repeatConfig = fixed.repeatConfig;
    current.repeatEndMode = fixed.repeatEndMode;
    current.repeatEndDate = fixed.repeatEndDate;
    current.repeatTimes = fixed.repeatTimes;
    current.repeatStartDate = fixed.repeatStartDate;
    current.currentDate = fixed.currentDate || fixed.repeatStartDate;
    return this.repeatRepository.update(current);
  }

  async find(id: string): Promise<Repeat> {
    return this.repeatRepository.find(id);
  }

  /**
   * 推进 currentDate 游标。返回结算前日期与下一日期；nextDate 为 null 表示系列结束。
   */
  async settleCurrent(id: string): Promise<{ settledCurrentDate: string; nextDate: string | null }> {
    const repeat = await this.repeatRepository.find(id);
    const fixed = this.fixCurrentDate({
      repeatMode: repeat.repeatMode,
      repeatConfig: repeat.repeatConfig,
      repeatEndMode: repeat.repeatEndMode,
      repeatEndDate: repeat.repeatEndDate,
      repeatTimes: repeat.repeatTimes,
      repeatStartDate: repeat.repeatStartDate,
      currentDate: repeat.currentDate,
    });
    const settledCurrentDate = fixed.currentDate || fixed.repeatStartDate;

    const calculatedNextDateResult = calculateNextDate(dayjs(settledCurrentDate), {
      repeatMode: fixed.repeatMode,
      repeatConfig: fixed.repeatConfig,
      repeatEndMode: fixed.repeatEndMode,
      repeatEndDate: fixed.repeatEndDate,
      repeatTimes: fixed.repeatTimes,
      repeatStartDate: fixed.repeatStartDate,
    });
    if (calculatedNextDateResult.ok === false) {
      throw new RepeatValidationError(calculatedNextDateResult.issues);
    }
    const nextDate = calculatedNextDateResult.value
      ? calculatedNextDateResult.value.format('YYYY-MM-DD')
      : null;

    if (nextDate) {
      repeat.currentDate = nextDate;
      await this.repeatRepository.update(repeat);
    }

    return { settledCurrentDate, nextDate };
  }

  fixCurrentDate<T extends RepeatRuleInput>(input: T): T {
    if (!input.currentDate) {
      return input;
    }
    const repeatConfig = {
      repeatMode: input.repeatMode,
      repeatConfig: input.repeatConfig,
      repeatEndMode: input.repeatEndMode,
      repeatEndDate: input.repeatEndDate,
      repeatTimes: input.repeatTimes,
      repeatStartDate: input.repeatStartDate,
    };

    const currentDate = dayjs(input.currentDate);
    const isCurrentDateValidResult = isValidDate(currentDate, repeatConfig);
    if (isCurrentDateValidResult.ok === false) {
      throw new RepeatValidationError(isCurrentDateValidResult.issues);
    }

    if (!isCurrentDateValidResult.value) {
      const validNextDateResult = calculateNextDate(currentDate.subtract(1, 'day'), repeatConfig);
      if (validNextDateResult.ok === false) {
        throw new RepeatValidationError(validNextDateResult.issues);
      }
      if (validNextDateResult.value) {
        input.currentDate = validNextDateResult.value.format('YYYY-MM-DD');
      }
    }

    return input;
  }

  assertValidRepeat(value: {
    repeatMode?: unknown;
    repeatConfig?: unknown;
    repeatEndMode?: unknown;
    repeatEndDate?: unknown;
    repeatTimes?: unknown;
    repeatStartDate?: unknown;
  }): void {
    assertRepeat({
      repeatMode: value.repeatMode,
      repeatConfig: value.repeatConfig,
      repeatEndMode: value.repeatEndMode,
      repeatEndDate: value.repeatEndDate,
      repeatTimes: value.repeatTimes,
      repeatStartDate: value.repeatStartDate,
    });
  }
}

export const repeatService = new RepeatService();
