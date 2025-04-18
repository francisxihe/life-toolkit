import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOperator,
  FindOptionsWhere,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
} from "typeorm";
import { Todo, TodoStatus, TodoRepeat } from "./entities";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoListFilterDto,
  TodoDto,
} from "./dto";
import dayjs from "dayjs";
import { TodoRepeatService } from "./todo-repeat.service";

function getWhere(filter: TodoPageFilterDto) {
  const where: FindOptionsWhere<Todo> = {};
  if (filter.planDateStart && filter.planDateEnd) {
    where.planDate = Between(
      new Date(filter.planDateStart + "T00:00:00"),
      new Date(filter.planDateEnd + "T23:59:59")
    );
  } else if (filter.planDateStart) {
    where.planDate = MoreThan(new Date(filter.planDateStart + "T00:00:00"));
  } else if (filter.planDateEnd) {
    where.planDate = LessThan(new Date(filter.planDateEnd + "T23:59:59"));
  }

  if (filter.doneDateStart && filter.doneDateEnd) {
    where.doneAt = Between(
      new Date(filter.doneDateStart + "T00:00:00"),
      new Date(filter.doneDateEnd + "T23:59:59")
    );
  } else if (filter.doneDateStart) {
    where.doneAt = MoreThan(new Date(filter.doneDateStart + "T00:00:00"));
  } else if (filter.doneDateEnd) {
    where.doneAt = LessThan(new Date(filter.doneDateEnd + "T23:59:59"));
  }

  if (filter.abandonedDateStart && filter.abandonedDateEnd) {
    where.abandonedAt = Between(
      new Date(filter.abandonedDateStart + "T00:00:00"),
      new Date(filter.abandonedDateEnd + "T23:59:59")
    );
  } else if (filter.abandonedDateStart) {
    where.abandonedAt = MoreThan(
      new Date(filter.abandonedDateStart + "T00:00:00")
    );
  } else if (filter.abandonedDateEnd) {
    where.abandonedAt = LessThan(
      new Date(filter.abandonedDateEnd + "T23:59:59")
    );
  }
  if (filter.keyword) {
    where.name = Like(`%${filter.keyword}%`);
  }
  if (filter.status) {
    where.status = filter.status;
  }
  if (filter.importance) {
    where.importance = filter.importance;
  }
  if (filter.urgency) {
    where.urgency = filter.urgency;
  }
  if (filter.taskId) {
    where.taskId = filter.taskId;
  }
  if (filter.taskIds) {
    where.taskId = In(filter.taskIds);
  }

  return where;
}

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    @InjectRepository(TodoRepeat)
    private readonly todoRepeatRepository: Repository<TodoRepeat>,
    private readonly todoRepeatService: TodoRepeatService
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      status: TodoStatus.TODO,
      tags: createTodoDto.tags || [],
      planDate: createTodoDto.planDate
        ? dayjs(createTodoDto.planDate).format("YYYY-MM-DD")
        : undefined,
    });

    await this.todoRepository.save(todo);

    // 如果有重复配置，创建重复配置
    if (createTodoDto.repeat) {
      const todoRepeat = this.todoRepeatRepository.create({
        ...createTodoDto.repeat,
      });
      await this.todoRepeatRepository.save(todoRepeat);
    }

    return {
      ...todo,
    };
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const todoList = await this.todoRepository.find({
      where: getWhere(filter),
    });

    return todoList.map((todo) => ({
      ...todo,
    }));
  }

  async page(
    filter: TodoPageFilterDto
  ): Promise<{ list: TodoDto[]; total: number }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [todoList, total] = await this.todoRepository.findAndCount({
      where: getWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: todoList.map((todo) => ({
        ...todo,
      })),
      total,
    };
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.todoRepository.update(id, {
      ...updateTodoDto,
      planDate: updateTodoDto.planDate
        ? dayjs(updateTodoDto.planDate).toDate()
        : undefined,
    });

    // 如果有重复配置，更新重复配置
    if (updateTodoDto.repeat) {
      await this.todoRepeatService.update(todo.id, updateTodoDto.repeat);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.todoRepository.delete(id);
  }

  async deleteByFilter(filter: TodoPageFilterDto): Promise<void> {
    await this.todoRepository.delete(getWhere(filter));
  }

  async findById(id: string): Promise<TodoDto> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new Error("Todo not found");
    }

    return {
      ...todo,
    };
  }
}
