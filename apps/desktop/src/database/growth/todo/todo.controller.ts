import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@life-toolkit/electron-ipc-router";
import { todoService } from "./todo.service";
import type { Todo as TodoVO } from "@life-toolkit/vo";
import {
  TodoMapper,
  TodoListFilterDto,
  TodoPageFiltersDto,
} from "@life-toolkit/business-server";

@Controller("/todo")
export class TodoController {
  @Post("/create")
  async create(@Body() payload: TodoVO.CreateTodoVo) {
    const createDto = TodoMapper.voToCreateDto(payload);
    const dto = await todoService.create(createDto as any);
    return TodoMapper.dtoToVo(dto);
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return TodoMapper.dtoToVo(await todoService.findById(id));
  }

  @Put("/update/:id")
  async update(
    @Param("id") id: string,
    @Body() payload: { updateVo?: TodoVO.UpdateTodoVo } & TodoVO.UpdateTodoVo
  ) {
    const updateDto = TodoMapper.voToUpdateDto(
      (payload?.updateVo ?? payload) as TodoVO.UpdateTodoVo
    );
    const dto = await todoService.update(id, updateDto as any);
    return TodoMapper.dtoToVo(dto);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return await todoService.delete(id);
  }

  @Get("/page")
  async page(@Query() q?: TodoVO.TodoPageFiltersVo) {
    const todoPageFiltersDto = new TodoPageFiltersDto();
    todoPageFiltersDto.importPageVo(q);
    const res = await todoService.page(todoPageFiltersDto);
    return TodoMapper.dtoToPageVo(
      res.list,
      res.total,
      todoPageFiltersDto.pageNum,
      todoPageFiltersDto.pageSize
    );
  }

  @Get("/list")
  async list(@Query() query: TodoVO.TodoListFiltersVo) {
    const filter = new TodoListFilterDto();
    filter.importListVo(query);
    return await todoService.list(filter);
  }

  @Put("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return await todoService.batchDone({
      idList: body?.idList ?? [],
    });
  }

  @Put("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return await todoService.abandon(id);
  }

  @Put("/restore/:id")
  async restore(@Param("id") id: string) {
    return await todoService.restore(id);
  }

  @Put("/done/:id")
  async done(@Param("id") id: string) {
    return await todoService.done(id);
  }
}
