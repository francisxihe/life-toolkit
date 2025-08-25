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
import { goalService } from "./goal.service";
import type { Goal as GoalVO } from "@life-toolkit/vo";
import { GoalMapper } from "@life-toolkit/business-server";
import { GoalStatus, GoalType } from "@life-toolkit/enum";
import type { GoalListFiltersVo } from "@life-toolkit/vo";

@Controller("/goal")
export class GoalController {
  @Post("/create")
  async create(@Body() payload: GoalVO.CreateGoalVo) {
    const dto = await goalService.create(GoalMapper.voToCreateDto(payload));
    return GoalMapper.dtoToItemVo(dto);
  }

  @Get("/findAll")
  async findAll() {
    return GoalMapper.dtoToVoList(await goalService.findAll());
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return GoalMapper.dtoToVo(await goalService.findById(id));
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() payload: GoalVO.UpdateGoalVo) {
    const dto = await goalService.update(id, GoalMapper.voToUpdateDto(payload));
    return GoalMapper.dtoToVo(dto);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return await goalService.delete(id);
  }

  @Get("/page")
  async page(
    @Query() q?: { pageNum?: number | string; pageSize?: number | string }
  ) {
    const pageNum = Number(q?.pageNum) || 1;
    const pageSize = Number(q?.pageSize) || 10;
    const res = await goalService.page(pageNum, pageSize);
    return GoalMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
  }

  @Get("/list")
  async list(@Query() filter?: GoalListFiltersVo) {
    return GoalMapper.dtoToListVo(await goalService.list(filter));
  }

  @Get("/tree")
  async tree() {
    return (await goalService.findTree()).map((dto) => GoalMapper.dtoToVo(dto));
  }

  @Get("/findRoots")
  async findRoots() {
    return (await goalService.findRoots()).map((dto) =>
      GoalMapper.dtoToVo(dto)
    );
  }

  @Get("/getTree")
  async getTree() {
    return (await goalService.findTree()).map((dto) => GoalMapper.dtoToVo(dto));
  }

  @Get("/findDetail/:id")
  async findDetail(@Param("id") id: string) {
    return GoalMapper.dtoToVo(await goalService.findDetail(id));
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    await goalService.batchDone(body?.idList ?? []);
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return GoalMapper.dtoToVo(
      await goalService.update(id, { status: GoalStatus.ABANDONED })
    );
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return GoalMapper.dtoToVo(
      await goalService.update(id, { status: GoalStatus.TODO })
    );
  }
}
