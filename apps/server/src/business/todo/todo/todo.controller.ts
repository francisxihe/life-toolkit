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
import { TodoPageFilterDto, TodoListFilterDto } from "./todo-dto";
import { Response } from "@/decorators/response.decorator";
import { TodoStatusService } from "../todo-status.service";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import {
  CreateTodoVO,
  TodoVO,
  TodoResponseVO,
  TodoWithSubResponseVO,
  TodoPageResponseVO,
  TodoListResponseVO,
  TodoBatchOperationResponseVO,
  TodoOperationResponseVO,
} from "@life-toolkit/vo/todo/todo";
import { TodoMapper } from "./todo.mapper";

@ApiTags("TodoController")
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
    const dto = TodoMapper.voToCreateDto(createTodoVO);
    const createdDto = await this.todoService.create(dto);
    return TodoMapper.dtoToVO(createdDto);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.todoService.delete(id);
  }
  @Put("update/:id")
  @Response()
  async update(@Param("id") id: string, @Body() updateTodoVO: CreateTodoVO) {
    const dto = TodoMapper.voToUpdateDto(updateTodoVO);
    const updatedDto = await this.todoService.update(id, dto);
    return TodoMapper.dtoToVO(updatedDto);
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
    const todos = await this.todoService.findAll(filter);
    return TodoMapper.dtoToListVO(todos);
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const todo = await this.todoService.findById(id);
    return TodoMapper.dtoToVO(todo);
  }
}
