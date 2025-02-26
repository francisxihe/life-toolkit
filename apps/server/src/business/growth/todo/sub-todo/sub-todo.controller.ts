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
import type { Todo } from "@life-toolkit/vo";
import { SubTodoMapper } from "./sub-todo.mapper";

@Controller("sub-todo")
export class SubTodoController {
  constructor(private readonly subTodoService: SubTodoService) {}

  /** 创建子待办事项 */
  @Post("create")
  @Response()
  async create(@Body() createSubTodoVo: Todo.CreateSubTodoVo) {
    const createdDto = SubTodoMapper.voToCreateDto(createSubTodoVo);
    const todoDto = await this.subTodoService.create(createdDto);
    return SubTodoMapper.dtoToVo(todoDto);
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
    @Body() updateSubTodoVo: Todo.CreateSubTodoVo
  ) {
    const updatedDto = SubTodoMapper.voToUpdateDto(updateSubTodoVo);
    const todoDto = await this.subTodoService.update(id, updatedDto);
    return SubTodoMapper.dtoToVo(todoDto);
  }

  /** 获取子待办事项详情 */
  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const dto = await this.subTodoService.findById(id);
    return SubTodoMapper.dtoToVo(dto);
  }

  /** 获取子待办列表 */
  @Get("list")
  @Response()
  async list(@Query() subTodoListFilterVo: Todo.SubTodoListFilterVo) {
    const dtoList = await this.subTodoService.findAll(subTodoListFilterVo);
    return SubTodoMapper.dtoToVoList(dtoList);
  }
}
