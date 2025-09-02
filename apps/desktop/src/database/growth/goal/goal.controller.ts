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
import type { Goal as GoalVO } from "@life-toolkit/vo";
import { GoalController as _GoalController } from "@life-toolkit/business-server";
import { goalService } from "./goal.service";

@Controller("/goal")
export class GoalController {
  private readonly controller = new _GoalController(goalService);

  @Post("/create")
  async create(@Body() body: GoalVO.CreateGoalVo) {
    return this.controller.create(body);
  }

  @Get("/detail/:id")
  async detail(@Param("id") id: string) {
    return this.controller.detail(id);
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() body: GoalVO.UpdateGoalVo) {
    return this.controller.update(id, body);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return this.controller.remove(id);
  }

  @Get("/page")
  async page(@Body() body: GoalVO.GoalPageFiltersVo) {
    return this.controller.page(body);
  }

  @Get("/list")
  async list(@Body() body: GoalVO.GoalListFiltersVo) {
    return this.controller.list(body);
  }

  @Get("/tree")
  async tree(@Body() body: GoalVO.GoalListFiltersVo) {
    return this.controller.tree(body);
  }

  @Get("/findRoots")
  async findRoots() {
    return this.controller.findRoots();
  }

  @Put("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return this.controller.abandon(id);
  }

  @Put("/restore/:id")
  async restore(@Param("id") id: string) {
    return this.controller.restore(id);
  }
}
