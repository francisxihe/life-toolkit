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
import type {
  Goal as GoalVO,
  GoalListFiltersVo,
  GoalPageFiltersVo,
} from "@life-toolkit/vo";
import {
  GoalMapper,
  GoalListFiltersDto,
  GoalPageFiltersDto,
  GoalController as _GoalController,
} from "@life-toolkit/business-server";
import { goalService } from "./goal.service";

@Controller("/goal")
export class GoalController {
  private readonly controller: _GoalController;
  constructor() {
    this.controller = new _GoalController(goalService);
  }

  @Post("/create")
  async create(@Body() payload: GoalVO.CreateGoalVo) {
    return this.controller.create(payload);
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() payload: GoalVO.UpdateGoalVo) {
    return this.controller.update(id, payload);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return this.controller.remove(id);
  }

  @Get("/page")
  async page(@Query() query?: GoalPageFiltersVo) {
    return this.controller.page(query);
  }

  @Get("/list")
  async list(@Query() query?: GoalListFiltersVo) {
    return this.controller.list(query);
  }

  @Get("/tree")
  async tree(@Query() query?: GoalListFiltersVo) {
    return this.controller.tree(query);
  }

  @Get("/findRoots")
  async findRoots() {
    return this.controller.findRoots();
  }

  @Get("/findDetail/:id")
  async findDetail(@Param("id") id: string) {
    return this.controller.findDetail(id);
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return this.controller.batchDone(body);
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return this.controller.abandon(id);
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return this.controller.restore(id);
  }
}
