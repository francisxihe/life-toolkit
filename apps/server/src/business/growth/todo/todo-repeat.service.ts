import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Between } from "typeorm";
import { Todo, TodoStatus, TodoRepeat, TodoSource } from "./entities";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { RepeatService } from "@life-toolkit/components-repeat/server";
import { TodoBaseService } from "./todo-base.service";
import { RepeatEndMode } from "@life-toolkit/components-repeat/types";
import { CreateTodoDto, TodoDto } from "@life-toolkit/business-server";

// 添加dayjs插件
dayjs.extend(isBetween);

@Injectable()
export class TodoRepeatService extends RepeatService {
  constructor(
    @InjectRepository(TodoRepeat)
    private readonly todoRepeatRepository: Repository<TodoRepeat>,
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly todoBaseService: TodoBaseService
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
    const where: FindOptionsWhere<Todo> = {
      repeatId: repeat.id,
      planDate: Between(
        nextDate.startOf("day").toDate(),
        nextDate.endOf("day").toDate()
      ),
    };

    const existingTodo = await this.todoRepository.findOne({
      where,
    });

    if (existingTodo) {
      return;
    }

    // 创建下一个待办
    const createTodoDto: CreateTodoDto = {
      name: todoWithRepeat.name,
      description: todoWithRepeat.description,
      tags: todoWithRepeat.tags,
      importance: todoWithRepeat.importance,
      urgency: todoWithRepeat.urgency,
      planDate: nextDate.toDate(),
      planStartAt: todoWithRepeat.planStartAt,
      planEndAt: todoWithRepeat.planEndAt,
      status: TodoStatus.TODO,
      taskId: todoWithRepeat.taskId,
    };

    // 直接通过Repository创建并设置repeatId
    const newTodo = this.todoRepository.create({
      ...createTodoDto,
      repeatId: repeat.id,
      source: TodoSource.REPEAT,
    });

    const savedTodo = await this.todoRepository.save(newTodo);
    
    // 更新重复配置，将其与新创建的待办关联
    await this.update(repeat.id, {
      ...repeat,
    });
    
    return savedTodo;
  }
}
