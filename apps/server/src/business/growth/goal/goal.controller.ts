import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { GoalService } from "./goal.service";
import { GoalMapper } from "./mappers/goal.mapper";
import type { Goal as GoalVO } from "@life-toolkit/vo";
import { CreateGoalDto, UpdateGoalDto, GoalPageFilterDto, GoalListFilterDto } from "./dto";
import { Response } from "@/decorators/response.decorator";

@Controller("goal")
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  /**
   * 创建目标
   */
  @Post("create")

  @Response()
  async create(@Body() createVo: GoalVO.CreateGoalVo): Promise<GoalVO.GoalItemVo> {
    const createDto = GoalMapper.voToCreateDto(createVo);
    const dto = await this.goalService.create(createDto);
    return GoalMapper.dtoToItemVo(dto);
  }

  /**
   * 分页查询目标列表
   */
  @Get("page")

  @Response()
  async page(@Query() filter: GoalPageFilterDto): Promise<GoalVO.GoalPageVo> {
    const { list, total } = await this.goalService.page(filter);
    return GoalMapper.dtoToPageVo(list, total, filter.pageNum || 1, filter.pageSize || 10);
  }

  /**
   * 列表查询目标
   */
  @Get("list")

  @Response()
  async list(@Query() filter: GoalListFilterDto): Promise<GoalVO.GoalListVo> {
    const goalList = await this.goalService.findAll(filter);
    return GoalMapper.dtoToListVo(goalList);
  }

  /**
   * 根据ID查询目标详情
   */
  @Get("detail/:id")

  @Response()
  async findDetail(@Param("id") id: string): Promise<GoalVO.GoalVo> {
    const dto = await this.goalService.findDetail(id);
    return GoalMapper.dtoToVo(dto);
  }

  /**
   * 更新目标
   */
  @Put("update/:id")

  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateVo: GoalVO.UpdateGoalVo
  ): Promise<GoalVO.GoalItemVo> {
    const updateDto = GoalMapper.voToUpdateDto(updateVo);
    const dto = await this.goalService.update(id, updateDto);
    return GoalMapper.dtoToItemVo(dto);
  }

  /**
   * 删除目标
   */
  @Delete("delete/:id")

  @Response()
  async delete(@Param("id") id: string): Promise<void> {
    await this.goalService.delete(id);
  }

  /**
   * 批量完成目标
   */
  @Put("batch-done")

  @Response()
  async batchDone(@Body() params: { idList: string[] }): Promise<void> {
    await this.goalService.batchDone(params.idList);
  }

  /**
   * 放弃目标
   */
  @Put("abandon/:id")

  @Response()
  async abandon(@Param("id") id: string): Promise<{ result: boolean }> {
    const result = await this.goalService.abandon(id);
    return { result };
  }

  /**
   * 恢复目标
   */
  @Put("restore/:id")

  @Response()
  async restore(@Param("id") id: string): Promise<{ result: boolean }> {
    const result = await this.goalService.restore(id);
    return { result };
  }
}
