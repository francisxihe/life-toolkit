import { Injectable } from "@nestjs/common";
import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mysql";
import { Todo, TodoStatus } from "../entities";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoListFilterDto,
  TodoDto,
  TodoWithSubDto,
} from "../dto";
import dayjs from "dayjs";

function getQuery(filter: TodoPageFilterDto) {
  const where: FilterQuery<Todo> = {};
  if (filter.planDateStart && filter.planDateEnd) {
    where.planDate = {
      $gte: new Date(filter.planDateStart + "T00:00:00"),
      $lte: filter.planDateEnd
        ? new Date(filter.planDateEnd + "T23:59:59")
        : undefined,
    };
  } else if (filter.planDateStart) {
    where.planDate = {
      $gte: new Date(filter.planDateStart + "T00:00:00"),
    };
  } else if (filter.planDateEnd) {
    where.planDate = {
      $lte: new Date(filter.planDateEnd + "T23:59:59"),
    };
  }

  if (filter.doneDateStart && filter.doneDateEnd) {
    where.doneAt = {
      $gte: new Date(filter.doneDateStart + "T00:00:00"),
      $lte: filter.doneDateEnd
        ? new Date(filter.doneDateEnd + "T23:59:59")
        : undefined,
    };
  } else if (filter.doneDateStart) {
    where.doneAt = {
      $gte: new Date(filter.doneDateStart + "T00:00:00"),
    };
  } else if (filter.doneDateEnd) {
    where.doneAt = {
      $lte: new Date(filter.doneDateEnd + "T23:59:59"),
    };
  }

  if (filter.abandonedDateStart && filter.abandonedDateEnd) {
    where.abandonedAt = {
      $gte: new Date(filter.abandonedDateStart + "T00:00:00"),
      $lte: new Date(filter.abandonedDateEnd + "T23:59:59"),
    };
  } else if (filter.abandonedDateStart) {
    where.abandonedAt = {
      $gte: new Date(filter.abandonedDateStart + "T00:00:00"),
    };
  } else if (filter.abandonedDateEnd) {
    where.abandonedAt = {
      $lte: new Date(filter.abandonedDateEnd + "T23:59:59"),
    };
  }
  if (filter.keyword) {
    where.name = { $like: `%${filter.keyword}%` };
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

  return where;
}

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: EntityRepository<Todo>,
    private readonly em: EntityManager
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      status: TodoStatus.TODO,
      tags: createTodoDto.tags || [],
      planDate: dayjs(createTodoDto.planDate).format("YYYY-MM-DD"),
      createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
    await this.em.persistAndFlush(todo);
    return {
      ...todo,
    };
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    try {
      const todoList = await this.todoRepository.find(getQuery(filter));

      return todoList.map((todo) => ({
        ...todo,
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async page(
    filter: TodoPageFilterDto
  ): Promise<{ list: TodoDto[]; total: number }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [todos, total] = await this.todoRepository.findAndCount(
      getQuery(filter),
      {
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
      }
    );

    return {
      list: todos.map((todo) => ({
        ...todo,
      })),
      total,
    };
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const todo = await this.todoRepository.findOne({ id });
    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.em.nativeUpdate(
      Todo,
      { id },
      {
        ...updateTodoDto,
        planDate: updateTodoDto.planDate
          ? dayjs(updateTodoDto.planDate).toDate()
          : undefined,
      }
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.todoRepository.nativeDelete(id);
  }

  async findById(id: string): Promise<TodoDto> {
    const todo = await this.todoRepository.findOne({ id });
    if (!todo) {
      throw new Error("Todo not found");
    }

    return {
      ...todo,
    };
  }

  async todoWithSub(id: string): Promise<TodoWithSubDto> {
    const todo = await this.todoRepository.findOne(
      { id },
      { populate: ["subTodoList"] }
    );

    if (!todo) {
      throw new Error("Todo not found");
    }

    return {
      ...todo,
      subTodoList: todo.subTodoList.getItems().map((subTodo) => ({
        ...subTodo,
      })),
    };
  }
}
