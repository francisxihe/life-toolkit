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
  CreateSubTodoVO,
  SubTodoListFilterVO,
} from "@life-toolkit/vo/todo/sub-todo";
import { SubTodoMapper } from "./sub-todo.mapper";

@Controller("sub-todo")
export class SubTodoController {
  constructor(
    private readonly subTodoService: SubTodoService,
    private readonly todoStatusService: TodoStatusService
  ) {}

  /** 获取子待办及其子待办 */
  @Get("sub-todo-with-sub/:id")
  @Response()
  async subTodoWithSub(@Param("id") id: string) {
    const dto = await this.subTodoService.subTodoWithSub(id);
    return SubTodoMapper.dtoToWithSubVO(dto);
  }

  /** 放弃子待办 */
  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    const result = await this.todoStatusService.abandon(id);
    return { result };
  }

  /** 恢复子待办 */
  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.todoStatusService.restore(id);
    return { result };
  }

  // getTodoSubTodoIdList

  /** 创建子待办事项 */
  @Post("create")
  @Response()
  async create(@Body() createSubTodoVO: CreateSubTodoVO) {
    const createdDto = SubTodoMapper.voToCreateDto(createSubTodoVO);
    const todoDto = await this.subTodoService.create(createdDto);
    return SubTodoMapper.dtoToVO(todoDto);
  }

  /** 删除子待办事项 */
  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.subTodoService.delete(id);
  }

  /** 更新子待办事项 */
  @Put("update/:id")
  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateSubTodoVO: CreateSubTodoVO
  ) {
    const updatedDto = SubTodoMapper.voToUpdateDto(updateSubTodoVO);
    const todoDto = await this.subTodoService.update(id, updatedDto);
    return SubTodoMapper.dtoToVO(todoDto);
  }

  /** 获取子待办事项详情 */
  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const dto = await this.subTodoService.findById(id);
    return SubTodoMapper.dtoToVO(dto);
  }

  /** 获取子待办列表 */
  @Get("list")
  @Response()
  async list(@Query() subTodoListFilterVO: SubTodoListFilterVO) {
    const dtoList = await this.subTodoService.findAll(subTodoListFilterVO);
    return SubTodoMapper.dtoToVOList(dtoList);
  }
}
