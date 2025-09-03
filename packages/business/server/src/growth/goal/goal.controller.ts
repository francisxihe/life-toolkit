import { Controller, Post, Put, Get, Delete, Body, Param, Query } from '@business/decorators';
import type { Goal as GoalVO } from '@life-toolkit/vo';
import {
  GoalListFiltersDto,
  GoalPageFiltersDto,
  CreateGoalDto,
  UpdateGoalDto,
  GoalDto,
} from '@life-toolkit/business-server';
import { GoalService } from './goal.service';

@Controller('/goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post('/create')
  async create(@Body() body: GoalVO.CreateGoalVo): Promise<GoalVO.GoalVo> {
    const createDto = CreateGoalDto.importVo(body);
    const dto = await this.goalService.create(createDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return await this.goalService.delete(id);
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() updateGoalVo: GoalVO.UpdateGoalVo) {
    const updateDto = UpdateGoalDto.importVo(updateGoalVo);
    const dto = await this.goalService.update(id, updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id')
  async find(@Param('id') id: string) {
    const dto = await this.goalService.find(id);
    return dto.exportVo();
  }

  @Get('/find-with-relations/:id')
  async findWithRelations(@Param('id') id: string) {
    const dto = await this.goalService.findWithRelations(id);
    return dto.exportVo();
  }

  @Get('/find-all')
  async findAll(@Query() goalListFiltersVo?: GoalVO.GoalListFiltersVo) {
    const goalListFiltersDto = new GoalListFiltersDto();
    goalListFiltersDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.findAll(goalListFiltersDto);
    return GoalDto.dtoListToListVo(list);
  }

  @Get('/page')
  async page(@Query() goalPageFiltersVo?: GoalVO.GoalPageFiltersVo) {
    const goalPageFilterDto = new GoalPageFiltersDto();
    goalPageFilterDto.importPageVo(goalPageFiltersVo ?? {});
    const { list, total, pageNum, pageSize } = await this.goalService.page(goalPageFilterDto);
    return GoalDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Get('/tree')
  async tree(@Query() goalListFiltersVo?: GoalVO.GoalListFiltersVo) {
    const goalListFiltersDto = new GoalListFiltersDto();
    goalListFiltersDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.getTree(goalListFiltersDto);
    return GoalDto.dtoListToListVo(list);
  }

  @Get('/find-roots')
  async findRoots() {
    return (await this.goalService.findRoots()).map((dto) => dto.exportVo());
  }

  @Put('/abandon/:id')
  async abandon(@Param('id') id: string) {
    return await this.goalService.abandon(id);
  }

  @Put('/restore/:id')
  async restore(@Param('id') id: string) {
    return await this.goalService.restore(id);
  }
}
