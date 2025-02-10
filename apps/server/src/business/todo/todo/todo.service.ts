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
} from "typeorm";
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

  return where;
}

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      status: createTodoDto.status || TodoStatus.TODO,
      tags: createTodoDto.tags || [],
      planDate: createTodoDto.planDate
        ? dayjs(createTodoDto.planDate).format("YYYY-MM-DD")
        : undefined,
    });
    await this.todoRepository.save(todo);
    return {
      ...todo,
    };
  }

  async findAll(filter: TodoListFilterDto): Promise<TodoDto[]> {
    const todos = await this.todoRepository.find({
      where: getWhere(filter),
    });

    return todos.map((todo) => ({
      ...todo,
    }));
  }

  async page(
    filter: TodoPageFilterDto
  ): Promise<{ list: TodoDto[]; total: number }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [todos, total] = await this.todoRepository.findAndCount({
      where: getWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: todos.map((todo) => ({
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

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.todoRepository.delete(id);
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

  async todoWithSub(id: string): Promise<TodoWithSubDto> {
    const todo = await this.todoRepository
      .createQueryBuilder("todo")
      .leftJoinAndSelect("todo.subTodoList", "subTodos")
      .where("todo.id = :id", { id })
      .getOne();

    if (!todo) {
      throw new Error("Todo not found");
    }

    return {
      ...todo,
      subTodoList: todo.subTodoList.map((subTodo) => ({
        ...subTodo,
      })),
    };
  }
}
