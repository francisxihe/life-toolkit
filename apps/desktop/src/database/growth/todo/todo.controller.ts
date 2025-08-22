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
import { TodoStatus } from "./todo.entity";
import type { Todo as TodoVO, TodoListVo } from "@life-toolkit/vo";
import { TodoMapper } from "@life-toolkit/business-server";
import { TodoListFilterDto } from "@life-toolkit/business-server";
@Controller("/todo")
export class TodoController {
  @Post("/create")
  async create(@Body() payload: TodoVO.CreateTodoVo) {
    const createDto = TodoMapper.voToCreateDto(payload);
    const dto = await todoService.createTodo(createDto as any);
    return TodoMapper.dtoToVo(dto);
  }

  @Get("/findAll")
  async findAll() {
    return TodoMapper.dtoToVoList(await todoService.findAll());
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return TodoMapper.dtoToVo(await todoService.findById(id));
  }

  @Get("/findByStatus/:status")
  async findByStatus(@Param("status") status: string) {
    return TodoMapper.dtoToVoList(
      await todoService.findByStatus(status as TodoStatus)
    );
  }

  @Get("/findTodayTodos")
  async findTodayTodos() {
    return TodoMapper.dtoToVoList(await todoService.findTodayTodos());
  }

  @Get("/findOverdueTodos")
  async findOverdueTodos() {
    return TodoMapper.dtoToVoList(await todoService.findOverdueTodos());
  }

  @Get("/findHighImportanceTodos")
  async findHighImportanceTodos() {
    return TodoMapper.dtoToVoList(await todoService.findHighImportanceTodos());
  }

  @Put("/updateStatus/:id")
  async updateStatus(
    @Param("id") id: string,
    @Body() payload?: { status?: TodoStatus }
  ) {
    return await todoService.updateStatus(id, payload?.status as TodoStatus);
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
  async page(
    @Query() q?: { pageNum?: number | string; pageSize?: number | string }
  ) {
    const pageNum = Number(q?.pageNum) || 1;
    const pageSize = Number(q?.pageSize) || 10;
    const res = await todoService.page(pageNum, pageSize);
    return TodoMapper.dtoToPageVo(
      res.data,
      res.total,
      (res as any).pageNum ?? pageNum,
      (res as any).pageSize ?? pageSize
    );
  }

  @Get("/list")
  async list(@Query() query: TodoVO.TodoListFiltersVo) {
    const filter = new TodoListFilterDto();
    filter.importVo(query);
    return await todoService.list(filter);
  }

  @Put("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return await todoService.batchDone(body?.idList ?? []);
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

  @Get("/getStatistics")
  async getStatistics() {
    return await todoService.getStatistics();
  }
}
