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
import { HabitLogService } from "./habit-log.service";
import { Response } from "@/decorators/response.decorator";
import { HabitLogMapper } from "./mapper";
import * as HabitVo from "@life-toolkit/vo/growth/habit";
import { ParseDatePipe } from "@/common/pipes/parse-date.pipe";

@Controller("habit-log")
export class HabitLogController {
  constructor(
    private readonly habitLogService: HabitLogService,
    private readonly habitLogMapper: HabitLogMapper,
  ) {}

  @Post("create")
  @Response()
  async create(@Body() createHabitLogVo: HabitVo.CreateHabitLogVo) {
    const habitLog = await this.habitLogService.create(
      this.habitLogMapper.voToDtoFromVo(createHabitLogVo)
    );
    return this.habitLogMapper.toVo(habitLog);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return await this.habitLogService.remove(id);
  }

  @Put("update/:id")
  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateHabitLogVo: HabitVo.UpdateHabitLogVo
  ) {
    const habitLog = await this.habitLogService.update(
      id,
      this.habitLogMapper.voToUpdateDtoFromVo(updateHabitLogVo)
    );
    return this.habitLogMapper.toVo(habitLog);
  }

  @Get("list/:habitId")
  @Response()
  async list(@Param("habitId") habitId: string) {
    const habitLogs = await this.habitLogService.findAll(habitId);
    return {
      list: habitLogs.map((log) => this.habitLogMapper.toVo(log)),
    };
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const habitLog = await this.habitLogService.findOne(id);
    return this.habitLogMapper.toVo(habitLog);
  }

  @Get("by-date/:habitId/:date")
  @Response()
  async findByDate(
    @Param("habitId") habitId: string,
    @Param("date", ParseDatePipe) date: Date
  ) {
    try {
      const habitLog = await this.habitLogService.findByDate(habitId, date);
      return this.habitLogMapper.toVo(habitLog);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return null; // 如果没有找到记录，返回null
      }
      throw error;
    }
  }

  @Get("date-range/:habitId")
  @Response()
  async findByDateRange(
    @Param("habitId") habitId: string,
    @Query("startDate", ParseDatePipe) startDate: Date,
    @Query("endDate", ParseDatePipe) endDate: Date
  ) {
    const habitLogs = await this.habitLogService.findByDateRange(
      habitId,
      startDate,
      endDate
    );
    return {
      list: habitLogs.map((log) => this.habitLogMapper.toVo(log)),
    };
  }
} 