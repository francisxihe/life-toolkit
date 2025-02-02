import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubTodo } from "../entities/sub-todo.entity";
import { CreateSubTodoDto, UpdateSubTodoDto } from "./sub-todo-dto";
import { TodoStatus } from "../entities/base.entity";
import dayjs from "dayjs";

@Injectable()
export class SubTodoService {
  constructor(
    @InjectRepository(SubTodo)
    private readonly subTodoRepository: Repository<SubTodo>
  ) {}

  private entityToDto(entity: SubTodo): CreateSubTodoDto {
    return {
      name: entity.name,
      description: entity.description,
      status: entity.status,
      tags: entity.tags,
      importance: entity.importance,
      urgency: entity.urgency,
      planDate: entity.planStartAt ? dayjs(entity.planStartAt).format('YYYY-MM-DD') : '',
      parentId: entity.parentId,
    };
  }

  async create(createSubTodoDto: CreateSubTodoDto): Promise<CreateSubTodoDto> {
    const subTodo = this.subTodoRepository.create();
    subTodo.name = createSubTodoDto.name;
    subTodo.description = createSubTodoDto.description;
    subTodo.status = createSubTodoDto.status || TodoStatus.TODO;
    subTodo.tags = createSubTodoDto.tags || [];
    subTodo.importance = createSubTodoDto.importance;
    subTodo.urgency = createSubTodoDto.urgency;
    subTodo.parentId = createSubTodoDto.parentId;
    subTodo.planStartAt = createSubTodoDto.planDate ? dayjs(createSubTodoDto.planDate).format('HH:mm') : undefined;

    const savedEntity = await this.subTodoRepository.save(subTodo);
    return this.entityToDto(savedEntity);
  }

  async findById(id: string): Promise<CreateSubTodoDto> {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }
    return this.entityToDto(subTodo);
  }

  async findAll(): Promise<CreateSubTodoDto[]> {
    const entities = await this.subTodoRepository.find({
      order: { createdAt: "DESC" },
    });
    return entities.map(entity => this.entityToDto(entity));
  }

  async update(
    id: string,
    updateSubTodoDto: UpdateSubTodoDto
  ): Promise<CreateSubTodoDto> {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }
    
    if (updateSubTodoDto.name) subTodo.name = updateSubTodoDto.name;
    if (updateSubTodoDto.description !== undefined) subTodo.description = updateSubTodoDto.description;
    if (updateSubTodoDto.status) subTodo.status = updateSubTodoDto.status;
    if (updateSubTodoDto.tags) subTodo.tags = updateSubTodoDto.tags;
    if (updateSubTodoDto.importance !== undefined) subTodo.importance = updateSubTodoDto.importance;
    if (updateSubTodoDto.urgency !== undefined) subTodo.urgency = updateSubTodoDto.urgency;
    if (updateSubTodoDto.parentId) subTodo.parentId = updateSubTodoDto.parentId;
    if (updateSubTodoDto.planDate) {
      subTodo.planStartAt = dayjs(updateSubTodoDto.planDate).format('HH:mm');
    }

    const savedEntity = await this.subTodoRepository.save(subTodo);
    return this.entityToDto(savedEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.subTodoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }
  }

  async subTodoWithSub(id: string): Promise<CreateSubTodoDto & { subTodoList: CreateSubTodoDto[] }> {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }

    // 递归获取子待办
    const recursiveGetSub = async (todoId: string): Promise<CreateSubTodoDto[]> => {
      const subTodoList = await this.subTodoRepository.find({
        where: { parentId: todoId },
      });

      return subTodoList.map(entity => this.entityToDto(entity));
    };

    const dto = this.entityToDto(subTodo);
    const subDtos = await recursiveGetSub(subTodo.id);
    return {
      ...dto,
      subTodoList: subDtos,
    };
  }
}
