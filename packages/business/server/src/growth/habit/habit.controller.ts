import type { Habit as HabitVO } from "@life-toolkit/vo";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitDto,
  HabitListFiltersDto,
  HabitPageFiltersDto,
} from "./dto";
import { HabitService } from "./habit.service";
import {
  Post,
  Get,
  Put,
  Delete,
  Controller,
  Body,
  Param,
  Query,
} from "@business/decorators";

@Controller("/habit")
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post("/create", { description: "创建习惯" })
  async create(@Body() createHabitVo: HabitVO.CreateHabitVo) {
    const createDto = new CreateHabitDto();
    createDto.importVo(createHabitVo);
    const dto = await this.habitService.create(createDto);
    return dto.exportVo();
  }

  @Get("/detail/:id", { description: "根据ID查询习惯详情" })
  async findById(@Param("id") id: string) {
    const dto = await this.habitService.findById(id);
    return dto.exportVo();
  }

  @Put("/update-streak/:id", { description: "更新习惯 streak" })
  async updateStreak(
    @Param("id") id: string,
    @Body() body?: { completed?: boolean }
  ) {
    return await this.habitService.updateStreak(id, body?.completed as any);
  }

  @Put("/update/:id", { description: "更新习惯" })
  async update(
    @Param("id") id: string,
    @Body() updateHabitVo: HabitVO.UpdateHabitVo
  ) {
    const updateDto = new UpdateHabitDto();
    updateDto.importVo(updateHabitVo);
    const dto = await this.habitService.update(id, updateDto);
    return dto.exportVo();
  }

  @Delete("/delete/:id", { description: "删除习惯" })
  async delete(@Param("id") id: string) {
    return await this.habitService.delete(id);
  }

  @Get("/page", { description: "分页查询习惯列表" })
  async page(@Query() habitPageFiltersVo?: HabitVO.HabitPageFiltersVo) {
    const filter = new HabitPageFiltersDto();
    if (habitPageFiltersVo) filter.importPageVo(habitPageFiltersVo);
    const { list, total, pageNum, pageSize } =
      await this.habitService.page(filter);
    return HabitDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Get("/list", { description: "查询习惯列表" })
  async list(@Query() habitListFiltersVo?: HabitVO.HabitListFiltersVo) {
    const filter = new HabitListFiltersDto();
    if (habitListFiltersVo) filter.importListVo(habitListFiltersVo);
    const list = await this.habitService.list(filter);
    return HabitDto.dtoListToListVo(list);
  }

  @Get("/todos/:id", { description: "查询习惯的待办事项" })
  async getHabitTodos(@Param("id") id: string) {
    return await this.habitService.getHabitTodos(id);
  }

  @Get("/analytics/:id", { description: "查询习惯的分析数据" })
  async getHabitAnalytics(@Param("id") id: string) {
    return await this.habitService.getHabitAnalytics(id);
  }

  @Put("/done/batch", { description: "批量完成习惯" })
  async doneBatch(@Body() body?: { includeIds?: string[] }) {
    return await Promise.all(
      (body?.includeIds ?? []).map((id: string) =>
        this.habitService.completeHabit(id)
      )
    );
  }

  @Put("/abandon/:id", { description: "废弃习惯" })
  async abandon(@Param("id") id: string) {
    return await this.habitService.abandon(id);
  }

  @Put("/restore/:id", { description: "恢复习惯" })
  async restore(@Param("id") id: string) {
    return await this.habitService.restore(id);
  }

  @Put("/pause/:id", { description: "暂停习惯" })
  async pauseHabit(@Param("id") id: string) {
    return await this.habitService.pauseHabit(id);
  }

  @Put("/resume/:id", { description: "恢复习惯" })
  async resumeHabit(@Param("id") id: string) {
    return await this.habitService.resumeHabit(id);
  }
}
