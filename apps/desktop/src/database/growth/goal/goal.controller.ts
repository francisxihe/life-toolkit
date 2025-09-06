import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@life-toolkit/electron-ipc-router';
import type { Goal as GoalVO } from '@life-toolkit/vo';
import { GoalController as _GoalController } from '@life-toolkit/business-server';
import { goalService } from './goal.service';

@Controller('/goal')
export class GoalController {
  private readonly controller = new _GoalController(goalService);

  @Post('/create')
  async create(@Body() body: GoalVO.CreateGoalVo) {
    return this.controller.create(body);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.controller.delete(id);
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() body: GoalVO.UpdateGoalVo) {
    return this.controller.update(id, body);
  }

  @Get('/find/:id')
  async find(@Param('id') id: string) {
    return this.controller.find(id);
  }

  @Get('/find-with-relations/:id')
  async findWithRelations(@Param('id') id: string) {
    return this.controller.findWithRelations(id);
  }

  @Get('/find-by-filter')
  async findByFilter(@Body() body: GoalVO.GoalFilterVo) {
    return this.controller.findByFilter(body);
  }

  @Get('/page')
  async page(@Body() body: GoalVO.GoalPageFilterVo) {
    return this.controller.page(body);
  }

  @Get('/get-tree')
  async getTree(@Body() body: GoalVO.GoalFilterVo) {
    return this.controller.getTree(body);
  }

  @Get('/find-roots')
  async findRoots() {
    return this.controller.findRoots();
  }

  @Put('/abandon/:id')
  async abandon(@Param('id') id: string) {
    return this.controller.abandon(id);
  }

  @Put('/restore/:id')
  async restore(@Param('id') id: string) {
    return this.controller.restore(id);
  }
}
