import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from "@nestjs/common";
import { TodoService } from "./todo.service";
import { TodoPageFilterDto, TodoListFilterDto } from "./dto";
import { Response } from "@/decorators/response.decorator";
import { TodoStatusService } from "./todo-status.service";
import type { Todo, OperationByIdListVo } from "@life-toolkit/vo";
import { TodoMapper } from "./mapper";
import { OperationMapper } from "@/common/operation";

@Controller("todo")
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoStatusService: TodoStatusService
  ) {}

  @Put("batch-done")
  @Response()
  async batchDone(@Body() idList: OperationByIdListVo) {
    return await this.todoStatusService.batchDone(
      OperationMapper.voToOperationByIdListDto(idList)
    );
  }

  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    const result = await this.todoStatusService.abandon(id);
    return { result };
  }

  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.todoStatusService.restore(id);
    return { result };
  }

  @Post("create")
  @Response()
  async create(@Body() createTodoVo: Todo.CreateTodoVo) {
    const createdDto = TodoMapper.voToCreateDto(createTodoVo);
    const dto = await this.todoService.create(createdDto);
    return TodoMapper.dtoToVo(dto);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.todoService.delete(id);
  }

  @Put("update/:id")
  @Response()
  async update(@Param("id") id: string, @Body() updateTodoVo: Todo.CreateTodoVo) {
    const updatedDto = TodoMapper.voToUpdateDto(updateTodoVo);
    const dto = await this.todoService.update(id, updatedDto);
    return TodoMapper.dtoToVo(dto);
  }

  @Get("page")
  @Response()
  async page(@Query() filter: TodoPageFilterDto) {
    const { list, total } = await this.todoService.page(filter);
    return TodoMapper.dtoToPageVo(
      list,
      total,
      filter.pageNum || 1,
      filter.pageSize || 10
    );
  }

  @Get("list")
  @Response()
  async list(@Query() filter: TodoListFilterDto) {
    const todoList = await this.todoService.findAll(filter);
    return TodoMapper.dtoToListVo(todoList);
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const todo = await this.todoService.findById(id);
    return TodoMapper.dtoToVo(todo);
  }
}
