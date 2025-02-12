import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mysql";
import { EntityManager } from "@mikro-orm/core";
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
    private readonly subTodoRepository: EntityRepository<SubTodo>,
    private readonly em: EntityManager
  ) {}

  async create(createSubTodoDto: CreateSubTodoDto) {
    const subTodo = this.subTodoRepository.create({
      ...createSubTodoDto,
      status: createSubTodoDto.status || TodoStatus.TODO,
      tags: createSubTodoDto.tags || [],
      planStartAt: createSubTodoDto.planStartAt
        ? dayjs(createSubTodoDto.planStartAt).format("HH:mm")
        : undefined,
      planEndAt: createSubTodoDto.planEndAt
        ? dayjs(createSubTodoDto.planEndAt).format("HH:mm")
        : undefined,
      createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
    await this.em.persistAndFlush(subTodo);
    return this.findById(subTodo.id);
  }

  async findById(id: string) {
    const subTodo = await this.subTodoRepository.findOne({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }
    return SubTodoMapper.entityToDto(subTodo);
  }

  async findAll(filter: SubTodoListFilterDto) {
    const entities = await this.subTodoRepository.find(
      { parentId: filter.parentId },
      { orderBy: { createdAt: "DESC" } }
    );
    return entities.map((entity) => SubTodoMapper.entityToDto(entity));
  }

  async update(id: string, updateSubTodoDto: UpdateSubTodoDto) {
    const subTodo = await this.subTodoRepository.findOne({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }

    const updateData = {
      ...updateSubTodoDto,
      planDate: updateSubTodoDto.planDate
        ? dayjs(updateSubTodoDto.planDate).format("YYYY-MM-DD")
        : undefined,
    };

    await this.em.nativeUpdate(
      SubTodo,
      { id },
      {
        ...updateData,
      }
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.subTodoRepository.nativeDelete(id);
  }

  async subTodoWithSub(
    id: string
  ): Promise<SubTodoDto & { subTodoList: SubTodoDto[] }> {
    const subTodo = await this.subTodoRepository.findOne({ id });
    if (!subTodo) {
      throw new NotFoundException(`SubTodo #${id} not found`);
    }

    // 递归获取子待办
    const recursiveGetSub = async (todoId: string) => {
      const subTodoList = await this.subTodoRepository.find({
        parentId: todoId,
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
