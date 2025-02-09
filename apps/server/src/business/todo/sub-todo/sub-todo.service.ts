import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubTodo } from "../entities/sub-todo.entity";
import { CreateSubTodoDto, UpdateSubTodoDto, SubTodoDto } from "./sub-todo-dto";
import { TodoStatus } from "../entities/base.entity";
import { SubTodoMapper } from "./sub-todo.mapper";
import dayjs from "dayjs";

@Injectable()
export class SubTodoService {
  constructor(
    @InjectRepository(SubTodo)
    private readonly subTodoRepository: Repository<SubTodo>
  ) {}

  async create(createSubTodoDto: CreateSubTodoDto) {
    const subTodo = this.subTodoRepository.create();
    subTodo.name = createSubTodoDto.name;
    subTodo.description = createSubTodoDto.description;
    subTodo.status = createSubTodoDto.status || TodoStatus.TODO;
    subTodo.tags = createSubTodoDto.tags || [];
    subTodo.importance = createSubTodoDto.importance;
    subTodo.urgency = createSubTodoDto.urgency;
    subTodo.parentId = createSubTodoDto.parentId;
    subTodo.planStartAt = createSubTodoDto.planDate
      ? dayjs(createSubTodoDto.planDate).format("HH:mm")
      : undefined;

    const savedEntity = await this.subTodoRepository.save(subTodo);
    return SubTodoMapper.entityToDto(savedEntity);
  }

  async findById(id: string) {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }
    return SubTodoMapper.entityToDto(subTodo);
  }

  async findAll() {
    const entities = await this.subTodoRepository.find({
      order: { createdAt: "DESC" },
    });
    return entities.map((entity) => SubTodoMapper.entityToDto(entity));
  }

  async update(id: string, updateSubTodoDto: UpdateSubTodoDto) {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }

    if (updateSubTodoDto.name) subTodo.name = updateSubTodoDto.name;
    if (updateSubTodoDto.description !== undefined)
      subTodo.description = updateSubTodoDto.description;
    if (updateSubTodoDto.status) subTodo.status = updateSubTodoDto.status;
    if (updateSubTodoDto.tags) subTodo.tags = updateSubTodoDto.tags;
    if (updateSubTodoDto.importance !== undefined)
      subTodo.importance = updateSubTodoDto.importance;
    if (updateSubTodoDto.urgency !== undefined)
      subTodo.urgency = updateSubTodoDto.urgency;
    if (updateSubTodoDto.parentId) subTodo.parentId = updateSubTodoDto.parentId;
    if (updateSubTodoDto.planDate) {
      subTodo.planStartAt = dayjs(updateSubTodoDto.planDate).format("HH:mm");
    }

    const savedEntity = await this.subTodoRepository.save(subTodo);
    return SubTodoMapper.entityToDto(savedEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.subTodoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }
  }

  async subTodoWithSub(
    id: string
  ): Promise<SubTodoDto & { subTodoList: SubTodoDto[] }> {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }

    // 递归获取子待办
    const recursiveGetSub = async (todoId: string) => {
      const subTodoList = await this.subTodoRepository.find({
        where: { parentId: todoId },
      });

      return subTodoList.map((entity) => SubTodoMapper.entityToDto(entity));
    };

    const dto = SubTodoMapper.entityToDto(subTodo);
    const subDtoList = await recursiveGetSub(subTodo.id);
    return {
      ...dto,
      subTodoList: subDtoList,
    };
  }
}
