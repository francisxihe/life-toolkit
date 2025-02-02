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
  TodoResponseVO,
  TodoWithSubResponseVO,
  TodoPageResponseVO,
  TodoListResponseVO,
  TodoBatchOperationResponseVO,
  TodoOperationResponseVO,
} from "./todo-vo";
import { TodoMapper } from "./todo.mapper";

@ApiTags("TodoController")
@Controller("todo")
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoStatusService: TodoStatusService
  ) {}

  @ApiOperation({
    summary: "批量完成待办事项",
    operationId: "batchDone",
  })
  @ApiBody({
    description: "待办事项ID列表",
    type: [String],
  })
  @ApiResponse({
    status: 200,
    description: "批量完成成功",
    type: TodoBatchOperationResponseVO,
  })
  @Put("batch-done")
  @Response()
  async batchDone(@Body() idList: string[]) {
    return await this.todoStatusService.batchDone(idList);
  }

  @ApiOperation({
    summary: "放弃待办事项",
    operationId: "abandon",
  })
  @ApiParam({ name: "id", type: String, description: "待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "放弃成功",
    type: TodoOperationResponseVO,
  })
  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    const result = await this.todoStatusService.abandon(id);
    return { result };
  }

  @ApiOperation({
    summary: "恢复待办事项",
    operationId: "restore",
  })
  @ApiParam({ name: "id", type: String, description: "待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "恢复成功",
    type: TodoOperationResponseVO,
  })
  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.todoStatusService.restore(id);
    return { result };
  }

  @ApiOperation({
    summary: "获取待办事项及其子待办事项",
    operationId: "getTodoWithSub",
  })
  @ApiParam({ name: "id", type: String, description: "待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: TodoWithSubResponseVO,
  })
  @Get("todo-with-sub/:id")
  @Response()
  async todoWithSub(@Param("id") id: string) {
    const dto = await this.todoService.todoWithSub(id);
    return TodoMapper.dtoToWithSubVO(dto);
  }

  @ApiOperation({
    summary: "创建待办事项",
    operationId: "create",
  })
  @ApiBody({ type: CreateTodoVO })
  @ApiResponse({
    status: 200,
    description: "创建成功",
    type: TodoResponseVO,
  })
  @Post("create")
  @Response()
  async create(@Body() createTodoVO: CreateTodoVO) {
    const dto = TodoMapper.voToCreateDto(createTodoVO);
    const createdDto = await this.todoService.create(dto);
    return TodoMapper.dtoToVO(createdDto);
  }

  @ApiOperation({
    summary: "删除待办事项",
    operationId: "delete",
  })
  @ApiParam({ name: "id", type: String, description: "待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "删除成功",
  })
  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.todoService.delete(id);
  }

  @ApiOperation({
    summary: "更新待办事项",
    operationId: "update",
  })
  @ApiParam({ name: "id", type: String, description: "待办事项ID" })
  @ApiBody({ type: CreateTodoVO })
  @ApiResponse({
    status: 200,
    description: "更新成功",
    type: TodoResponseVO,
  })
  @Put("update/:id")
  @Response()
  async update(@Param("id") id: string, @Body() updateTodoVO: CreateTodoVO) {
    const dto = TodoMapper.voToUpdateDto(updateTodoVO);
    const updatedDto = await this.todoService.update(id, dto);
    return TodoMapper.dtoToVO(updatedDto);
  }

  @ApiOperation({
    summary: "分页获取待办事项列表",
    operationId: "getPage",
  })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: TodoPageResponseVO,
  })
  @Get("page")
  @Response()
  async page(@Query() filter: TodoPageFilterDto) {
    const { records, total } = await this.todoService.page(filter);
    return TodoMapper.dtoToPageVO(
      records,
      total,
      filter.pageNum || 1,
      filter.pageSize || 10
    );
  }

  @ApiOperation({
    summary: "获取待办事项列表",
    operationId: "getList",
  })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: TodoListResponseVO,
  })
  @Get("list")
  @Response()
  async list(@Query() filter: TodoListFilterDto) {
    const todos = await this.todoService.findAll(filter);
    return TodoMapper.dtoToListVO(todos);
  }

  @ApiOperation({
    summary: "获取待办事项详情",
    operationId: "getDetail",
  })
  @ApiParam({ name: "id", type: String, description: "待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: TodoResponseVO,
  })
  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const todo = await this.todoService.findById(id);
    return TodoMapper.dtoToVO(todo);
  }
}
