import { Todo } from "../entities/todo.entity";
import {
  TodoVO,
  TodoWithSubVO,
  TodoPageVO,
  TodoListVO,
  CreateTodoVO,
} from "@life-toolkit/vo/todo/todo";
import { CreateTodoDto, UpdateTodoDto, TodoDto } from "./todo-dto";
import { TodoStatus } from "../entities/base.entity";
import { TodoRepeat } from "../entities/todo.entity";

export class TodoMapper {
  static dtoToVO(dto: TodoDto): TodoVO {
    const vo: TodoVO = {
      name: dto.name || "",
      description: dto.description || null,
      status: dto.status || TodoStatus.TODO,
      tags: dto.tags || null,
      importance: dto.importance || null,
      urgency: dto.urgency || null,
      planDate: dto.planDate || "",
      planTimeRange: null,
      repeat: dto.repeat || TodoRepeat.NONE,
      id: dto.id,
      updatedAt: dto.updatedAt,
      createdAt: dto.createdAt,
      doneAt: dto.doneAt,
      abandonedAt: dto.abandonedAt,
    };
    return vo;
  }

  static dtoToVOList(dtoList: TodoDto[]): TodoVO[] {
    return dtoList.map((dto) => this.dtoToVO(dto));
  }

  static dtoToWithSubVO(
    dto: TodoDto,
    subDtoList: (CreateTodoDto | UpdateTodoDto)[] = []
  ): TodoWithSubVO {
    const vo = {
      ...this.dtoToVO(dto),
      subTodoList: this.dtoToVOList(subDtoList),
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
}
