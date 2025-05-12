import type { Todo as TodoVO } from "@life-toolkit/vo";
import { CreateTodoDto, UpdateTodoDto, TodoDto } from "../dto";
import { TodoStatus } from "../entities";
import { Todo } from "../entities/todo.entity";
import dayjs from "dayjs";
import { BaseMapper } from "@/base/base.mapper";
import { TaskMapper } from "../../task/mappers";
import { RepeatMapper } from "@life-toolkit/components-repeat/server";

export class TodoMapperEntity {
  static entityToDto(entity: Todo): TodoDto {
    const dto = new TodoDto();
    Object.assign(dto, BaseMapper.entityToDto(entity));
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
    dto.planStartAt = entity.planStartAt;
    dto.planEndAt = entity.planEndAt;
    dto.task = entity.task ? TaskMapper.entityToDto(entity.task) : undefined;
    return dto;
  }
}

class TodoMapperDto extends TodoMapperEntity {
  static dtoToVo(dto: TodoDto): TodoVO.TodoVo {
    const vo: TodoVO.TodoVo = {
      ...BaseMapper.dtoToVo(dto),
      name: dto.name || "",
      description: dto.description,
      status: dto.status || TodoStatus.TODO,
      tags: dto.tags,
      importance: dto.importance,
      urgency: dto.urgency,
      planDate: dayjs(dto.planDate).format("YYYY-MM-DD"),
      planStartAt: dto.planStartAt,
      planEndAt: dto.planEndAt,
      repeat: dto.repeat,
      doneAt: dto.doneAt
        ? dayjs(dto.doneAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      abandonedAt: dto.abandonedAt
        ? dayjs(dto.abandonedAt).format("YYYY/MM/DD HH:mm:ss")
        : undefined,
      task: dto.task ? TaskMapper.dtoToVo(dto.task) : undefined,
    };
    return vo;
  }

  static dtoToVoList(dtoList: TodoDto[]): TodoVO.TodoVo[] {
    return dtoList.map((dto) => this.dtoToVo(dto));
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
}

class TodoMapperVo extends TodoMapperDto {
  static voToCreateDto(vo: TodoVO.CreateTodoVo): CreateTodoDto {
    const dto = new CreateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags || [];
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = dayjs(vo.planDate).toDate();
    console.log("vo.repeat", vo.repeat);
    console.log("vo.repeat", RepeatMapper);
    dto.repeat = vo.repeat ? RepeatMapper.voToCreateDto(vo.repeat) : undefined;
    dto.taskId = vo.taskId;
    return dto;
  }

  static voToUpdateDto(vo: TodoVO.UpdateTodoVo): UpdateTodoDto {
    const dto = new UpdateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = dayjs(vo.planDate).toDate();
    dto.repeat = vo.repeat ? RepeatMapper.voToUpdateDto(vo.repeat) : undefined;
    dto.taskId = vo.taskId;
    return dto;
  }
}

export class TodoMapper extends TodoMapperVo {}
