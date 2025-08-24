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
import { taskService } from "./task.service";
import { TaskStatus } from "@life-toolkit/enum";
import type { Task as TaskVO } from "@life-toolkit/vo";
import { TaskMapper } from "@life-toolkit/business-server";

@Controller("/task")
export class TaskController {
  @Post("/create")
  async create(@Body() payload: TaskVO.CreateTaskVo) {
    return TaskMapper.dtoToVo(
      await taskService.create(TaskMapper.voToCreateDto(payload))
    );
  }

  @Get("/findAll")
  async findAll() {
    return TaskMapper.dtoToVoList(await taskService.findAll());
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return TaskMapper.dtoToVo(await taskService.findById(id));
  }

  @Get("/findTree")
  async findTree() {
    return (await taskService.findTree()).map((e) =>
      TaskMapper.dtoToVo(TaskMapper.entityToDto(e as any))
    );
  }

  @Get("/findByGoalId/:goalId")
  async findByGoalId(@Param("goalId") goalId: string) {
    return TaskMapper.dtoToVoList(await taskService.findByGoalId(goalId));
  }

  @Get("/findByStatus/:status")
  async findByStatus(@Param("status") status: string) {
    return TaskMapper.dtoToVoList(
      await taskService.findByStatus(status as TaskStatus)
    );
  }

  @Post("/updateStatus/:id")
  async updateStatus(
    @Param("id") id: string,
    @Body() payload?: { status?: TaskStatus }
  ) {
    return await taskService.updateStatus(id, payload?.status as TaskStatus);
  }

  @Put("/update/:id")
  async update(
    @Param("id") id: string,
    @Body() payload: TaskVO.CreateTaskVo
  ) {
    return TaskMapper.dtoToVo(
      await taskService.update(
        id,
        TaskMapper.voToUpdateDto(payload as TaskVO.CreateTaskVo)
      )
    );
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return await taskService.delete(id);
  }

  @Get("/page")
  async page(
    @Query() q?: { pageNum?: number | string; pageSize?: number | string }
  ) {
    const pageNum = Number(q?.pageNum) || 1;
    const pageSize = Number(q?.pageSize) || 10;
    const res = await taskService.page(pageNum, pageSize);
    return TaskMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
  }

  @Get("/list")
  async list() {
    return TaskMapper.dtoToListVo(await taskService.list());
  }

  @Get("/taskWithTrackTime/:id")
  async taskWithTrackTime(@Param("id") id: string) {
    return TaskMapper.dtoToWithTrackTimeVo(
      await taskService.taskWithTrackTime(id)
    );
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return (
      await Promise.all(
        (body?.idList ?? []).map((id: string) =>
          taskService.update(id, { status: TaskStatus.DONE })
        )
      )
    ).map((dto) => TaskMapper.dtoToVo(dto));
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return TaskMapper.dtoToVo(
      await taskService.update(id, { status: TaskStatus.ABANDONED })
    );
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return TaskMapper.dtoToVo(
      await taskService.update(id, { status: TaskStatus.TODO })
    );
  }
}
