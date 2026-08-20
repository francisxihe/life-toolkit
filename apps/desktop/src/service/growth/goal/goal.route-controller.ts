import { Controller, Post, Put, Get, Delete, Body, Param, Query } from '@business/decorators';
import type { Goal as GoalVO, ResponsePageVo, ResponseListVo, ResponseTreeVo } from '@true-north/vo';
import { GoalFilterDto, GoalPageFilterDto, CreateGoalDto, UpdateGoalDto, GoalDto } from './dto';
import { GoalService, goalService as defaultGoalService } from './goal.service';

@Controller('/goal')
export class GoalController {
  /** 默认注入模块单例，供 electron-ipc-restful 无参实例化 */
  constructor(private readonly goalService: GoalService = defaultGoalService) {}

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
    const dto = await this.goalService.findWithRelations(id);
    console.log('dto', dto.exportVo());
    return dto.exportVo();
  }

  @Get('/list', { description: '查询目标列表' })
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
    @Query() goalPageFilterVo?: GoalVO.GoalPageFilterVo
  ): Promise<ResponsePageVo<GoalVO.GoalWithoutRelationsVo>> {
    const goalPageFilterDto = new GoalPageFilterDto();
    goalPageFilterDto.importPageVo(goalPageFilterVo ?? { pageNum: 1, pageSize: 10 });
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

  @Get('/children/:parentId', { description: '获取指定父目标的子目标列表' })
  async findChildren(@Param('parentId') parentId: string): Promise<GoalVO.GoalVo[]> {
    const filterDto = new GoalFilterDto();
    filterDto.parentId = parentId;
    const children = await this.goalService.findByFilter(filterDto);
    return children.map((dto) => dto.exportVo());
  }

  @Put('/abandon/:id', { description: '废弃目标' })
  async abandon(@Param('id') id: string): Promise<boolean> {
    return await this.goalService.abandon(id);
  }

  @Put('/done/:id', { description: '完成目标' })
  async markDone(@Param('id') id: string): Promise<boolean> {
    return await this.goalService.done(id);
  }

  @Put('/restore/:id', { description: '恢复目标' })
  async restore(@Param('id') id: string): Promise<boolean> {
    return await this.goalService.restore(id);
  }
}
