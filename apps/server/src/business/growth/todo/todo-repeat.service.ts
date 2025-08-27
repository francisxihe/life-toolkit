import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { RepeatService } from "@life-toolkit/components-repeat/server";
import { RepeatEndMode } from "@life-toolkit/components-repeat/types";
import { CreateTodoDto, TodoDto, Todo } from "@life-toolkit/business-server";
import { TodoRepository } from "./todo.repository";
import { TodoRepeat } from "@life-toolkit/business-server";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

// 添加dayjs插件
dayjs.extend(isBetween);

@Injectable()
export class TodoRepeatService extends RepeatService {
  constructor(
    @InjectRepository(TodoRepeat)
    private readonly todoRepeatRepository: Repository<TodoRepeat>,
    private readonly todoRepo: TodoRepository
  ) {
    super(todoRepeatRepository);
  }

  /**
   * 创建下一个重复的待办事项
   */
  async createNextTodo(todoWithRepeat: TodoDto | Todo) {
    if (!todoWithRepeat.repeatId) {
      return;
    }

    // 获取重复配置
    const repeat = (await this.findById(todoWithRepeat.repeatId)) as TodoRepeat;
    if (!repeat) {
      return;
    }

    // 检查重复结束条件
    if (repeat.repeatEndMode === RepeatEndMode.FOR_TIMES) {
      if (repeat.repeatTimes && repeat.repeatTimes <= 0) {
        return; // 重复次数已用完
      }

      // 减少重复次数
      await this.update(repeat.id, {
        ...repeat,
        repeatTimes: (repeat.repeatTimes || 1) - 1,
      });
    } else if (repeat.repeatEndMode === RepeatEndMode.TO_DATE) {
      if (
        repeat.repeatEndDate &&
        dayjs().isAfter(dayjs(repeat.repeatEndDate))
      ) {
        return; // 已超过结束日期
      }
    }

    // 计算下一个待办日期
    const nextDate = this.calculateNextDate(
      dayjs(todoWithRepeat.planDate),
      repeat
    );

    if (!nextDate) {
      return;
    }

    // 检查是否已经存在该日期的待办
    const existingTodo = await this.todoRepo.findOneByRepeatAndDate(
      repeat.id,
      nextDate.toDate()
    );

    if (existingTodo) {
      return;
    }

    // 创建下一个待办（优先使用模板字段）
    const planStartFromRepeat = repeat.startAt
      ? dayjs(repeat.startAt).format("HH:mm:ss")
      : undefined;
    const planEndFromRepeat = repeat.endAt
      ? dayjs(repeat.endAt).format("HH:mm:ss")
      : undefined;

    const createTodoDto: CreateTodoDto = Object.assign(new CreateTodoDto(), {
      name: repeat.name ?? todoWithRepeat.name,
      description: repeat.description ?? todoWithRepeat.description,
      tags: repeat.tags ?? todoWithRepeat.tags,
      importance: repeat.importance ?? todoWithRepeat.importance,
      urgency: repeat.urgency ?? todoWithRepeat.urgency,
      planDate: nextDate.toDate(),
      planStartAt: planStartFromRepeat ?? todoWithRepeat.planStartAt,
      planEndAt: planEndFromRepeat ?? todoWithRepeat.planEndAt,
      status: TodoStatus.TODO,
      taskId: todoWithRepeat.taskId,
    });

    // 通过仓储创建并设置 repeatId、source
    const savedTodo = await this.todoRepo.createWithExtras(createTodoDto, {
      repeatId: repeat.id,
      source: TodoSource.REPEAT,
    });

    // 更新重复配置，将其与新创建的待办关联
    await this.update(repeat.id, {
      ...repeat,
    });

    return savedTodo;
  }
}
