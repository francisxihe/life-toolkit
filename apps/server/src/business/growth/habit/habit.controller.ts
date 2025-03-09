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
import { HabitPageFilterDto, HabitFilterDto } from "./dto";
import { Response } from "@/decorators/response.decorator";
import { HabitMapper } from "./mapper";
import type { Habit, OperationByIdListVo } from "@life-toolkit/vo";
import { OperationMapper } from "@/common/operation";

@Controller("habit")
export class HabitController {
  constructor(
    private readonly habitService: HabitService,
    private readonly habitMapper: HabitMapper
  ) {}

  @Put("batch-complete")
  @Response()
  async batchComplete(@Body() idList: OperationByIdListVo) {
    return await this.habitService.batchComplete(
      OperationMapper.voToOperationByIdListDto(idList).idList
    );
  }

  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    const result = await this.habitService.abandon(id);
    return { result };
  }

  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.habitService.restore(id);
    return { result };
  }

  @Put("pause/:id")
  @Response()
  async pause(@Param("id") id: string) {
    const result = await this.habitService.pause(id);
    return { result };
  }

  @Put("resume/:id")
  @Response()
  async resume(@Param("id") id: string) {
    const result = await this.habitService.resume(id);
    return { result };
  }

  @Post("create")
  @Response()
  async create(@Body() createHabitVO: Habit.CreateHabitVo) {
    const habit = await this.habitService.create(
      this.habitMapper.voToDtoFromVo(createHabitVO)
    );
    return this.habitMapper.toVo(habit);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return await this.habitService.remove(id);
  }

  @Put("update/:id")
  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateHabitVO: Habit.UpdateHabitVo
  ) {
    const habit = await this.habitService.update(
      id,
      this.habitMapper.voToUpdateDtoFromVo(updateHabitVO)
    );
    return this.habitMapper.toVo(habit);
  }

  @Get("page")
  @Response()
  async page(@Query() filter: HabitPageFilterDto) {
    const result = await this.habitService.findPage(filter);
    return {
      list: result.list.map((habit) => this.habitMapper.toVo(habit)),
      total: result.total,
      pageNum: result.pageNum,
      pageSize: result.pageSize,
    };
  }

  @Get("list")
  @Response()
  async list(@Query() filter: HabitFilterDto) {
    const habits = await this.habitService.findAll(filter);
    return {
      list: habits.map((habit) => this.habitMapper.toVo(habit)),
    };
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const habit = await this.habitService.findOne(id);
    return this.habitMapper.toVo(habit);
  }
}
