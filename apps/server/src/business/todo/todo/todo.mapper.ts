import { SubTodoMapper } from "../sub-todo/sub-todo.mapper";
import type { Todo as TodoVO } from "@life-toolkit/vo";
import { CreateTodoDto, UpdateTodoDto, TodoDto, TodoWithSubDto } from "../dto";
import { TodoStatus, TodoRepeat } from "../entities";
import { Todo } from "../entities/todo.entity";
import dayjs from "dayjs";
export class TodoMapper {
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

  static dtoToVo(dto: TodoDto): TodoVO.TodoVo {
    const vo: TodoVO.TodoVo = {
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
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      id: dto.id,
      updatedAt: dayjs(dto.updatedAt).format("YYYY/MM/DD HH:mm:ss"),
      createdAt: dayjs(dto.createdAt).format("YYYY/MM/DD HH:mm:ss"),
    };
    return vo;
  }

  static dtoToVoList(dtoList: TodoDto[]): TodoVO.TodoVo[] {
    return dtoList.map((dto) => this.dtoToVo(dto));
  }

  static dtoToWithSubVo(dto: TodoWithSubDto): TodoVO.TodoWithSubVo {
    const vo = {
      ...this.dtoToVo(dto),
      subTodoList: SubTodoMapper.dtoToVoList(dto.subTodoList),
    };
    return vo;
  }

  static dtoToPageVo(
    dtoList: TodoDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): TodoVO.TodoPageVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
      total,
      pageNum,
      pageSize,
    };
    return vo;
  }

  static dtoToListVo(dtoList: TodoDto[]): TodoVO.TodoListVo {
    const vo = {
      list: this.dtoToVoList(dtoList),
    };
    return vo;
  }

  static voToCreateDto(vo: TodoVO.CreateTodoVo): CreateTodoDto {
    const dto = new CreateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags || [];
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = dayjs(vo.planDate).toDate();
    dto.repeat = vo.repeat as TodoRepeat;
    return dto;
  }

  static voToUpdateDto(vo: TodoVO.CreateTodoVo): UpdateTodoDto {
    const dto = new UpdateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = dayjs(vo.planDate).toDate();
    dto.repeat = vo.repeat as TodoRepeat;
    return dto;
  }
}
