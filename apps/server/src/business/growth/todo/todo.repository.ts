import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsWhere,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
} from "typeorm";
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoPageFilterDto,
  TodoFilterDto,
  TodoDto,
  Todo,
} from "@life-toolkit/business-server";
import dayjs from "dayjs";
import { TodoStatus } from "@life-toolkit/enum";

@Injectable()
export class TodoRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
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

    return this.findById(todo.id);
  }


  async findAll(filter: TodoFilterDto): Promise<TodoDto[]> {
    const todoList = await this.todoRepository.find({
      where: this.buildWhere(filter),
    });

    return todoList as TodoDto[];
  }

  async page(filter: TodoPageFilterDto): Promise<{
    list: TodoDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [todoList, total] = await this.todoRepository.findAndCount({
      where: this.buildWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: todoList as TodoDto[],
      total,
      pageNum,
      pageSize,
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

  async batchUpdate(
    includeIds: string[],
    updateTodoDto: UpdateTodoDto
  ): Promise<TodoDto[]> {
    if (!includeIds || includeIds.length === 0) return [];

    await this.todoRepository.update(
      { id: In(includeIds) },
      {
        ...updateTodoDto,
        planDate: updateTodoDto.planDate
          ? dayjs(updateTodoDto.planDate).toDate()
          : undefined,
      }
    );

    const updated = await this.todoRepository.find({
      where: { id: In(includeIds) },
    });
    return (updated as unknown as TodoDto[]) || [];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.todoRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByFilter(filter: TodoPageFilterDto): Promise<void> {
    await this.todoRepository.delete(this.buildWhere(filter));
  }

  async findById(id: string, relations?: string[]): Promise<TodoDto> {
    try {
      const todo = await this.todoRepository.findOne({
        where: { id },
        relations: relations || [],
      });
      if (!todo) {
        throw new Error("Todo not found");
      }

      // 手动加载repeat关系
      if (todo.repeatId) {
        const todoWithRepeat = await this.todoRepository.findOne({
          where: { id },
          relations: ["repeat"],
        });
        if (todoWithRepeat?.repeat) {
          todo.repeat = todoWithRepeat.repeat;
        }
      }

      return todo as TodoDto;
    } catch (error) {
      console.error(error);
      throw new Error("Todo not found");
    }
  }



  private buildWhere(
    filter: TodoPageFilterDto | TodoFilterDto
  ): FindOptionsWhere<Todo> {
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
}
