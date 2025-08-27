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
import { HabitService } from "./habit.service";
import {
  HabitPageFiltersDto,
  HabitListFiltersDto,
  HabitMapper,
} from "@life-toolkit/business-server";
import { Response } from "@/decorators/response.decorator";
import type { Habit, OperationByIdListVo } from "@life-toolkit/vo";
import { OperationMapper } from "@/common/operation";

@Controller("habit")
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Put("batch-done")
  @Response()
  async batchDone(@Body() idList: OperationByIdListVo) {
    return await this.habitService.batchDone(
      OperationMapper.voToOperationByIdListDto(idList)
    );
  }

  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    await this.habitService.abandon(id);
    return { result: true };
  }

  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    await this.habitService.restore(id);
    return { result: true };
  }

  @Put("pause/:id")
  @Response()
  async pause(@Param("id") id: string) {
    await this.habitService.pause(id);
    return { result: true };
  }

  @Put("resume/:id")
  @Response()
  async resume(@Param("id") id: string) {
    await this.habitService.resume(id);
    return { result: true };
  }

  @Post("create")
  @Response()
  async create(@Body() createHabitVO: Habit.CreateHabitVo) {
    const dto = await this.habitService.create(
      HabitMapper.voToCreateDto(createHabitVO)
    );
    return HabitMapper.dtoToVo(dto);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return await this.habitService.delete(id);
  }

  @Put("update/:id")
  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateHabitVO: Habit.UpdateHabitVo
  ) {
    const dto = await this.habitService.update(
      id,
      HabitMapper.voToUpdateDto(updateHabitVO)
    );
    return HabitMapper.dtoToVo(dto);
  }

  @Get("page")
  @Response()
  async page(@Query() filter: HabitPageFiltersDto) {
    const { list, total } = await this.habitService.page(filter);
    return HabitMapper.dtoToPageVo(
      list,
      total,
      filter.pageNum || 1,
      filter.pageSize || 10
    );
  }

  @Get("list")
  @Response()
  async list(@Query() filter: HabitListFiltersDto) {
    const habits = await this.habitService.findAll(filter);
    return HabitMapper.dtoToListVo(habits);
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const habit = await this.habitService.findById(id);
    return HabitMapper.dtoToVo(habit);
  }

  @Get("todos/:id")
  @Response()
  async getHabitTodos(@Param("id") id: string) {
    const result = await this.habitService.getHabitTodos(id);
    return result;
  }

  @Get("analytics/:id")
  @Response()
  async getHabitAnalytics(@Param("id") id: string) {
    const result = await this.habitService.getHabitAnalytics(id);
    return result;
  }
}
