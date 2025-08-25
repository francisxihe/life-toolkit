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
  GoalListFilterDto,
  GoalPageFilterDto,
} from "@life-toolkit/business-server";
import { GoalStatus, GoalType } from "@life-toolkit/enum";
import { goalService } from "./goal.service";

@Controller("/goal")
export class GoalController {
  @Post("/create")
  async create(@Body() payload: GoalVO.CreateGoalVo) {
    const dto = await goalService.create(GoalMapper.voToCreateDto(payload));
    return GoalMapper.dtoToItemVo(dto);
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
  async page(@Query() query?: GoalPageFiltersVo) {
    const goalPageFilterDto = new GoalPageFilterDto();
    goalPageFilterDto.importPageVo(query);
    const res = await goalService.page(goalPageFilterDto);
    return GoalMapper.dtoToPageVo(
      res.list,
      res.total,
      goalPageFilterDto.pageNum,
      goalPageFilterDto.pageSize
    );
  }

  @Get("/list")
  async list(@Query() query?: GoalListFiltersVo) {
    const goalListFilterDto = new GoalListFilterDto();
    goalListFilterDto.importListVo(query);
    const list = await goalService.findAll(goalListFilterDto);
    return GoalMapper.dtoToListVo(list);
  }

  @Get("/tree")
  async tree(@Query() query?: GoalListFiltersVo) {
    const goalListFilterDto = new GoalListFilterDto();
    goalListFilterDto.importListVo(query);
    const list = await goalService.getTree(goalListFilterDto);
    return list.map((dto) => GoalMapper.dtoToVo(dto));
  }

  @Get("/findRoots")
  async findRoots() {
    return (await goalService.findRoots()).map((dto) =>
      GoalMapper.dtoToVo(dto)
    );
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
