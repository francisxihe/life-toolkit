import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Between } from "typeorm";
import { Todo, TodoStatus, TodoRepeat } from "./entities";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { RepeatService } from "@life-toolkit/components-repeat/server/service";
import { TodoDto } from "./dto";
import { TodoBaseService } from "./todo-base.service";
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
   * 创建单个待办事项
   */
  async createNextTodo(todoWithRepeat: TodoDto) {
    console.log("todoWithRepeat", todoWithRepeat);
    // 检查是否已经存在该日期的待办
    const where: FindOptionsWhere<Todo> = {
      id: todoWithRepeat.id,
      // planDate: Between(
      //   date.startOf("day").toDate(),
      //   date.endOf("day").toDate()
      // ),
    };

    const existingTodo = await this.todoRepository.findOne({
      where,
    });

    if (existingTodo) {
      return;
    }

    await this.todoBaseService.create({
      ...todoWithRepeat,
      // planDate: date.toDate(),
      status: TodoStatus.TODO,
    });
  }
}
