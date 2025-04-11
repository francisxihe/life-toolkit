import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Between } from "typeorm";
import { Todo, TodoStatus, TodoRepeat } from "./entities";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { RepeatMode } from "@life-toolkit/components-repeat";
import { RepeatService } from "@life-toolkit/components-repeat/server/service";

// 添加dayjs插件
dayjs.extend(isBetween);

@Injectable()
export class TodoRepeatService extends RepeatService {
  constructor(
    @InjectRepository(TodoRepeat)
    private readonly todoRepeatRepository: Repository<TodoRepeat>,
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {
    super(todoRepeatRepository);
  }

  /**
   * 生成下一周的重复待办事项
   */
  async generateNextWeekTodos() {
    const todoRepeats = await this.todoRepeatRepository.find({
      relations: ["todo"],
    });

    const nextWeekStart = dayjs().startOf("week").add(1, "week");
    const nextWeekEnd = nextWeekStart.endOf("week");

    for (const todoRepeat of todoRepeats) {
      await this.generateTodosForWeek(todoRepeat, nextWeekStart, nextWeekEnd);
    }
  }

  /**
   * 为指定的一周生成重复待办事项
   */
  private async generateTodosForWeek(
    todoRepeat: TodoRepeat,
    weekStart: dayjs.Dayjs,
    weekEnd: dayjs.Dayjs
  ) {
    const { repeatMode, repeatConfig, todo } = todoRepeat;

    if (!repeatMode || repeatMode === RepeatMode.NONE || !repeatConfig) {
      return;
    }

    switch (repeatMode) {
      case RepeatMode.DAILY:
        // 生成每天的重复待办
        for (let i = 0; i < 7; i++) {
          const date = weekStart.add(i, "day");
          await this.createTodo(todo, date);
        }
        break;
      case RepeatMode.WEEKLY:
        // 生成每周的重复待办
        if ("weekdays" in repeatConfig) {
          const weekdays = repeatConfig.weekdays;
          for (const weekday of weekdays) {
            const date = weekStart.day(weekday);
            await this.createTodo(todo, date);
          }
        }
        break;
      case RepeatMode.MONTHLY:
        // 生成每月的重复待办
        if ("monthlyType" in repeatConfig) {
          const { monthlyType } = repeatConfig;
          if (monthlyType === "day" && "day" in repeatConfig) {
            const day = repeatConfig.day;
            const date = weekStart.date(day);
            if (date.isBetween(weekStart, weekEnd, "day", "[]")) {
              await this.createTodo(todo, date);
            }
          }
        }
        break;
    }
  }

  /**
   * 创建单个待办事项
   */
  private async createTodo(templateTodo: Todo, date: dayjs.Dayjs) {
    // 检查是否已经存在该日期的待办
    const where: FindOptionsWhere<Todo> = {
      name: templateTodo.name,
      planDate: Between(
        date.startOf("day").toDate(),
        date.endOf("day").toDate()
      ),
    };

    const existingTodo = await this.todoRepository.findOne({
      where,
    });

    if (existingTodo) {
      return;
    }

    const todo = this.todoRepository.create({
      ...templateTodo,
      id: undefined,
      planDate: date.toDate(),
      status: TodoStatus.TODO,
    });

    await this.todoRepository.save(todo);
  }
}
