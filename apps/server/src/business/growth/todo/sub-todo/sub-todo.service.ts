import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubTodo, TodoStatus } from "../entities";
import {
  CreateSubTodoDto,
  UpdateSubTodoDto,
  SubTodoDto,
  SubTodoListFilterDto,
} from "../dto";
import { SubTodoMapper } from "./sub-todo.mapper";
import dayjs from "dayjs";

@Injectable()
export class SubTodoService {
  constructor(
    @InjectRepository(SubTodo)
    private readonly subTodoRepository: Repository<SubTodo>
  ) {}

  async create(createSubTodoDto: CreateSubTodoDto) {
    const subTodo = this.subTodoRepository.create({
      ...createSubTodoDto,
      status: TodoStatus.TODO, 
      tags: createSubTodoDto.tags || [],
    });
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

  async findAll(subTodoListFilterDto: SubTodoListFilterDto) {
    const entities = await this.subTodoRepository.find({
      where: { parentId: subTodoListFilterDto.parentId },
      order: { createdAt: "DESC" },
    });
    return entities.map((entity) => SubTodoMapper.entityToDto(entity));
  }

  async update(id: string, updateSubTodoDto: UpdateSubTodoDto) {
    const subTodo = await this.subTodoRepository.findOneBy({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }

    const savedEntity = await this.subTodoRepository.save({
      ...subTodo,
      ...updateSubTodoDto,
    });
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
    const subTodoDtoList = await recursiveGetSub(subTodo.id);
    return {
      ...dto,
      subTodoList: subTodoDtoList,
    };
  }
}
