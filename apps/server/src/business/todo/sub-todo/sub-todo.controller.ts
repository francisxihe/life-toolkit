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
import { SubTodoService } from "./sub-todo.service";
import { TodoStatusService } from "../todo-status.service";
import { Response } from "@/decorators/response.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import {
  CreateSubTodoVO,
  SubTodoResponseVO,
  SubTodoListResponseVO,
  SubTodoOperationResponseVO,
} from "./sub-todo-vo";
import { SubTodoMapper } from "./sub-todo.mapper";

@ApiTags("SubTodoController")
@Controller("sub-todo")
export class SubTodoController {
  constructor(
    private readonly subTodoService: SubTodoService,
    private readonly todoStatusService: TodoStatusService
  ) {}

  @ApiOperation({
    summary: "获取子待办及其子待办",
    operationId: "subTodoWithSub",
  })
  @ApiParam({ name: "id", type: String, description: "子待办ID" })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: SubTodoResponseVO,
  })
  @Get("sub-todo-with-sub/:id")
  @Response()
  async subTodoWithSub(@Param("id") id: string) {
    const dto = await this.subTodoService.subTodoWithSub(id);
    return SubTodoMapper.dtoToVO(dto);
  }

  @ApiOperation({
    summary: "放弃子待办",
    operationId: "abandon",
  })
  @ApiParam({ name: "id", type: String, description: "子待办ID" })
  @ApiResponse({
    status: 200,
    description: "放弃成功",
    type: SubTodoOperationResponseVO,
  })
  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    const result = await this.todoStatusService.abandon(id);
    return { result };
  }

  @ApiOperation({
    summary: "恢复子待办",
    operationId: "restore",
  })
  @ApiParam({ name: "id", type: String, description: "子待办ID" })
  @ApiResponse({
    status: 200,
    description: "恢复成功",
    type: SubTodoOperationResponseVO,
  })
  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.todoStatusService.restore(id);
    return { result };
  }

  // getTodoSubTodoIdList

  // getSubTodoList

  @ApiOperation({
    summary: "创建子待办事项",
    operationId: "create",
  })
  @ApiBody({ type: CreateSubTodoVO })
  @ApiResponse({
    status: 200,
    description: "创建成功",
    type: SubTodoResponseVO,
  })
  @Post("create")
  @Response()
  async create(@Body() createSubTodoVO: CreateSubTodoVO) {
    const dto = SubTodoMapper.voToCreateDto(createSubTodoVO);
    const createdDto = await this.subTodoService.create(dto);
    return SubTodoMapper.dtoToVO(createdDto);
  }

  @ApiOperation({
    summary: "删除子待办事项",
    operationId: "delete",
  })
  @ApiParam({ name: "id", type: String, description: "子待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "删除成功",
  })
  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.subTodoService.delete(id);
  }

  @ApiOperation({
    summary: "更新子待办事项",
    operationId: "update",
  })
  @ApiParam({ name: "id", type: String, description: "子待办事项ID" })
  @ApiBody({ type: CreateSubTodoVO })
  @ApiResponse({
    status: 200,
    description: "更新成功",
    type: SubTodoResponseVO,
  })
  @Put("update/:id")
  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateSubTodoVO: CreateSubTodoVO
  ) {
    const dto = SubTodoMapper.voToUpdateDto(updateSubTodoVO);
    const updatedDto = await this.subTodoService.update(id, dto);
    return SubTodoMapper.dtoToVO(updatedDto);
  }

  @ApiOperation({
    summary: "获取子待办事项详情",
    operationId: "getDetail",
  })
  @ApiParam({ name: "id", type: String, description: "子待办事项ID" })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: SubTodoResponseVO,
  })
  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const dto = await this.subTodoService.findById(id);
    return SubTodoMapper.dtoToVO(dto);
  }

  @ApiOperation({
    summary: "获取子待办列表",
    operationId: "list",
  })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    type: SubTodoListResponseVO,
  })
  @Get("list")
  @Response()
  async list() {
    const dtos = await this.subTodoService.findAll();
    return SubTodoMapper.dtoToVOList(dtos);
  }
}
