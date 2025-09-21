import { Controller, Post, Put, Get, Delete, Body, Param, Query } from '@business/decorators';
import type { Goal as GoalVO, ResponsePageVo, ResponseListVo, ResponseTreeVo } from '@life-toolkit/vo';
import { GoalFilterDto, GoalPageFilterDto, CreateGoalDto, UpdateGoalDto, GoalDto } from '@life-toolkit/business-server';
import { GoalService } from './goal.service';

@Controller('/goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post('/create', { description: '创建目标' })
  async create(@Body() body: GoalVO.CreateGoalVo): Promise<GoalVO.GoalVo> {
    const createDto = new CreateGoalDto();
    createDto.importCreateVo(body);
    const dto = await this.goalService.create(createDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除目标' })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.goalService.delete(id);
  }

  @Put('/update/:id', { description: '更新目标' })
  async update(@Param('id') id: string, @Body() updateGoalVo: GoalVO.UpdateGoalVo): Promise<GoalVO.GoalVo> {
    const updateDto = new UpdateGoalDto();
    updateDto.id = id;
    updateDto.importUpdateVo(updateGoalVo);
    const dto = await this.goalService.update(updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id', { description: '根据ID查询目标详情' })
  async find(@Param('id') id: string): Promise<GoalVO.GoalVo> {
    const dto = await this.goalService.find(id);
    return dto.exportVo();
  }

  @Get('/find-with-relations/:id', { description: '根据ID查询目标及关联信息' })
  async findWithRelations(@Param('id') id: string): Promise<GoalVO.GoalVo> {
    const dto = await this.goalService.findWithRelations(id);
    return dto.exportVo();
  }

  @Get('/find-by-filter', { description: '查询目标列表' })
  async findByFilter(
    @Query() goalListFiltersVo?: GoalVO.GoalFilterVo
  ): Promise<ResponseListVo<GoalVO.GoalWithoutRelationsVo>> {
    const goalListFiltersDto = new GoalFilterDto();
    goalListFiltersDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.findByFilter(goalListFiltersDto);
    return GoalDto.dtoListToListVo(list);
  }

  @Get('/page', { description: '分页查询目标列表' })
  async page(
    @Query() goalPageFiltersVo?: GoalVO.GoalPageFilterVo
  ): Promise<ResponsePageVo<GoalVO.GoalWithoutRelationsVo>> {
    const goalPageFilterDto = new GoalPageFilterDto();
    goalPageFilterDto.importPageVo(goalPageFiltersVo ?? {});
    const { list, total, pageNum, pageSize } = await this.goalService.page(goalPageFilterDto);
    return GoalDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Get('/get-tree', { description: '查询目标树形结构' })
  async getTree(@Query() goalListFiltersVo?: GoalVO.GoalFilterVo): Promise<ResponseTreeVo<GoalVO.GoalVo>> {
    const goalListFiltersDto = new GoalFilterDto();
    goalListFiltersDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.getTree(goalListFiltersDto);
    return list.map((dto) => dto.exportVo());
  }

  @Get('/find-roots', { description: '查询根目标列表' })
  async findRoots(): Promise<GoalVO.GoalVo[]> {
    return (await this.goalService.findRoots()).map((dto) => dto.exportVo());
  }

  @Put('/abandon/:id', { description: '废弃目标' })
  async abandon(@Param('id') id: string): Promise<boolean> {
    return await this.goalService.abandon(id);
  }

  @Put('/restore/:id', { description: '恢复目标' })
  async restore(@Param('id') id: string): Promise<boolean> {
    return await this.goalService.restore(id);
  }
}
