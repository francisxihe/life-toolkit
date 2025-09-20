import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  TodoRepeatService as _TodoRepeatService,
  TodoRepeat,
  TodoRepeatRepository,
} from '@life-toolkit/business-server';

// 添加dayjs插件
dayjs.extend(isBetween);

@Injectable()
export class TodoRepeatService extends _TodoRepeatService {
  constructor(private readonly todoRepeatRepository: TodoRepeatRepository) {
    super(todoRepeatRepository);
  }
}
