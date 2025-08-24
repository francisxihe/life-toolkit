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
  async list(@Query() filter?: any) {
    return GoalMapper.dtoToListVo(await goalService.list(filter));
  }

  // --- 以下为对齐原 REST 路由补充 ---

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

  // GET /goal/findChildren （payload 透传 parentId）
  @Get("/findChildren")
  async findChildrenByQuery(@Query() q?: { parentId?: string }) {
    const list = await goalService.findChildren(String(q?.parentId || ""));
    return list.map((dto) => GoalMapper.dtoToVo(dto));
  }

  // GET /goal/findChildren/:parentId
  @Get("/findChildren/:parentId")
  async findChildrenByParam(@Param("parentId") parentId: string) {
    const list = await goalService.findChildren(parentId);
    return list.map((dto) => GoalMapper.dtoToVo(dto));
  }

  @Get("/findByType/:type")
  async findByType(@Param("type") type: string) {
    return GoalMapper.dtoToVoList(
      await goalService.findByType(type as GoalType)
    );
  }

  @Get("/findByStatus/:status")
  async findByStatus(@Param("status") status: string) {
    return GoalMapper.dtoToVoList(
      await goalService.findByStatus(status as GoalStatus)
    );
  }

  // 与 getTree 对齐（等价于 tree）
  @Get("/getTree")
  async getTree() {
    return (await goalService.findTree()).map((dto) => GoalMapper.dtoToVo(dto));
  }

  @Get("/findDetail/:id")
  async findDetail(@Param("id") id: string) {
    return GoalMapper.dtoToVo(await goalService.findById(id));
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    await goalService.batchDone(body?.idList ?? []);
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return GoalMapper.dtoToVo(
      await goalService.update(id, { status: GoalStatus.ABANDONED } as any)
    );
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return GoalMapper.dtoToVo(
      await goalService.update(id, { status: GoalStatus.TODO } as any)
    );
  }
}
