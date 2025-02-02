import { Todo } from "../entities/todo.entity";
import { TodoVO, TodoWithSubVO, TodoPageVO, TodoListVO, CreateTodoVO } from "./todo-vo";
import { CreateTodoDto, UpdateTodoDto } from "./todo-dto";
import { TodoStatus } from "../entities/base.entity";
import { TodoRepeat } from "../entities/todo.entity";
import dayjs from "dayjs";

export class TodoMapper {
  static dtoToVO(dto: CreateTodoDto | UpdateTodoDto): TodoVO {
    const vo = new TodoVO();
    vo.name = dto.name || '';
    vo.description = dto.description || null;
    vo.status = dto.status || TodoStatus.TODO;
    vo.tags = dto.tags || null;
    vo.importance = dto.importance || null;
    vo.urgency = dto.urgency || null;
    vo.planDate = dto.planDate || '';
    vo.planTimeRange = null;
    vo.repeat = dto.repeat || TodoRepeat.NONE;
    return vo;
  }

  static dtoToVOList(dtos: (CreateTodoDto | UpdateTodoDto)[]): TodoVO[] {
    return dtos.map(dto => this.dtoToVO(dto));
  }

  static dtoToWithSubVO(dto: CreateTodoDto | UpdateTodoDto, subDtos: (CreateTodoDto | UpdateTodoDto)[] = []): TodoWithSubVO {
    const vo = new TodoWithSubVO();
    Object.assign(vo, this.dtoToVO(dto));
    vo.subTodoList = this.dtoToVOList(subDtos);
    return vo;
  }

  static dtoToPageVO(dtos: (CreateTodoDto | UpdateTodoDto)[], total: number, pageNum: number, pageSize: number): TodoPageVO {
    const vo = new TodoPageVO();
    vo.list = this.dtoToVOList(dtos);
    vo.total = total;
    vo.pageNum = pageNum;
    vo.pageSize = pageSize;
    return vo;
  }

  static dtoToListVO(dtos: (CreateTodoDto | UpdateTodoDto)[]): TodoListVO {
    const vo = new TodoListVO();
    vo.list = this.dtoToVOList(dtos);
    return vo;
  }

  static voToCreateDto(vo: CreateTodoVO): CreateTodoDto {
    const dto = new CreateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = vo.planDate;
    dto.repeat = vo.repeat;
    return dto;
  }

  static voToUpdateDto(vo: CreateTodoVO): UpdateTodoDto {
    const dto = new UpdateTodoDto();
    dto.name = vo.name;
    dto.description = vo.description;
    dto.status = vo.status;
    dto.tags = vo.tags;
    dto.importance = vo.importance;
    dto.urgency = vo.urgency;
    dto.planDate = vo.planDate;
    dto.repeat = vo.repeat;
    return dto;
  }
}
