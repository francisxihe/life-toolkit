import { SubTodoMapper } from "../sub-todo/sub-todo.mapper";
import {
  TodoVO,
  TodoWithSubVO,
  TodoPageVO,
  TodoListVO,
  CreateTodoVO,
} from "@life-toolkit/vo/todo/todo";
import { CreateTodoDto, UpdateTodoDto, TodoDto } from "./todo-dto";
import { SubTodoDto } from "../sub-todo/sub-todo-dto";
import { TodoStatus } from "../entities/base.entity";
import { TodoRepeat } from "../entities/todo.entity";
import { Todo } from "../entities/todo.entity";
import dayjs from "dayjs";
import { TodoWithSubDto } from "./todo-dto";
export class TodoMapper {
  static dtoToVO(dto: TodoDto): TodoVO {
    const vo: TodoVO = {
      name: dto.name || "",
      description: dto.description,
      status: dto.status || TodoStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      planDate: dayjs(dto.planDate).format("YYYY-MM-DD"),
      planStartAt: dto.planStartAt,
      planEndAt: dto.planEndAt,
      repeat: dto.repeat || TodoRepeat.NONE,
      doneAt: dto.doneAt,
      abandonedAt: dto.abandonedAt,
      id: dto.id,
      updatedAt: dayjs(dto.updatedAt).format("YYYY/MM/DD HH:mm:ss"),
      createdAt: dayjs(dto.createdAt).format("YYYY/MM/DD HH:mm:ss"),
    };
    return vo;
  }

  static dtoToVOList(dtoList: TodoDto[]): TodoVO[] {
    return dtoList.map((dto) => this.dtoToVO(dto));
  }

  static dtoToWithSubVO(dto: TodoWithSubDto): TodoWithSubVO {
    const vo = {
      ...this.dtoToVO(dto),
      subTodoList: SubTodoMapper.dtoToVOList(dto.subTodoList),
    };
    return vo;
  }

  static dtoToPageVO(
    dtoList: TodoDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): TodoPageVO {
    const vo = {
      list: this.dtoToVOList(dtoList),
      total,
      pageNum,
      pageSize,
    };
    return vo;
  }

  static dtoToListVO(dtoList: TodoDto[]): TodoListVO {
    const vo = {
      list: this.dtoToVOList(dtoList),
    };
    return vo;
  }

  static voToCreateDto(vo: CreateTodoVO): CreateTodoDto {
    const dto = new CreateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status as TodoStatus;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = vo.planDate;
    dto.repeat = vo.repeat as TodoRepeat;
    return dto;
  }

  static voToUpdateDto(vo: CreateTodoVO): UpdateTodoDto {
    const dto = new UpdateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status as TodoStatus;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = vo.planDate;
    dto.repeat = vo.repeat as TodoRepeat;
    return dto;
  }

  static entityToDto(entity: Todo): TodoDto {
    const dto = new TodoDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.tags = entity.tags;
    dto.importance = entity.importance;
    dto.urgency = entity.urgency;
    dto.planDate = entity.planDate;
    dto.repeat = entity.repeat;
    dto.doneAt = entity.doneAt;
    dto.abandonedAt = entity.abandonedAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdAt = entity.createdAt;
    dto.planStartAt = entity.planStartAt;
    dto.planEndAt = entity.planEndAt;
    dto.deletedAt = entity.deletedAt;
    return dto;
  }
}
