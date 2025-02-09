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
import { TodoPageFilterDto, TodoListFilterDto, TodoDto } from "./todo-dto";
import { Response } from "@/decorators/response.decorator";
import { TodoStatusService } from "../todo-status.service";
import { CreateTodoVO, TodoVO } from "@life-toolkit/vo/todo/todo";
import { TodoMapper } from "./todo.mapper";

@Controller("todo")
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoStatusService: TodoStatusService
  ) {}

  @Put("batch-done")
  @Response()
  async batchDone(@Body() idList: string[]) {
    return await this.todoStatusService.batchDone(idList);
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

  @Get("todo-with-sub/:id")
  @Response()
  async todoWithSub(@Param("id") id: string) {
    const dto = await this.todoService.todoWithSub(id);
    return TodoMapper.dtoToWithSubVO(dto);
  }

  @Post("create")
  @Response()
  async create(@Body() createTodoVO: CreateTodoVO) {
    const createdDto = TodoMapper.voToCreateDto(createTodoVO);
    const dto = await this.todoService.create(createdDto);
    return TodoMapper.dtoToVO(dto);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.todoService.delete(id);
  }
  @Put("update/:id")
  @Response()
  async update(@Param("id") id: string, @Body() updateTodoVO: CreateTodoVO) {
    const updatedDto = TodoMapper.voToUpdateDto(updateTodoVO);
    const dto = await this.todoService.update(id, updatedDto);
    return TodoMapper.dtoToVO(dto);
  }

  @Get("page")
  @Response()
  async page(@Query() filter: TodoPageFilterDto) {
    const { list, total } = await this.todoService.page(filter);
    return TodoMapper.dtoToPageVO(
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
    return TodoMapper.dtoToListVO(todoList);
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const todo = await this.todoService.findById(id);
    return TodoMapper.dtoToVO(todo);
  }
}
