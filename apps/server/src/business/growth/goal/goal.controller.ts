import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from "@nestjs/common";
import { GoalService } from "./goal.service";
import { GoalPageFilterDto, GoalListFilterDto } from "./dto";
import { Response } from "@/decorators/response.decorator";
import { GoalStatusService } from "./goal-status.service";
import type { Goal, OperationByIdListVo } from "@life-toolkit/vo";
import { GoalMapper } from "./mappers";
import { OperationMapper } from "@/common/operation";

@Controller("goal")
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly goalStatusService: GoalStatusService
  ) {}

  @Put("batch-done")
  @Response()
  async batchDone(@Body() idList: OperationByIdListVo) {
    return await this.goalStatusService.batchDone(
      OperationMapper.voToOperationByIdListDto(idList)
    );
  }

  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    const result = await this.goalStatusService.abandon(id);
    return { result };
  }

  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.goalStatusService.restore(id);
    return { result };
  }

  @Post("create")
  @Response()
  async create(@Body() createGoalVo: Goal.CreateGoalVo) {
    const createdDto = GoalMapper.voToCreateDto(createGoalVo);
    const dto = await this.goalService.create(createdDto);
    return GoalMapper.dtoToVo(dto);
  }

  @Delete("delete/:id")
  @Response()
  async remove(@Param("id") id: string) {
    return this.goalService.delete(id);
  }

  @Put("update/:id")
  @Response()
  async update(@Param("id") id: string, @Body() updateGoalVo: Goal.CreateGoalVo) {
    const updatedDto = GoalMapper.voToUpdateDto(updateGoalVo);
    const dto = await this.goalService.update(id, updatedDto);
    return GoalMapper.dtoToVo(dto);
  }

  @Get("page")
  @Response()
  async page(@Query() filter: GoalPageFilterDto) {
    const { list, total } = await this.goalService.page(filter);
    return GoalMapper.dtoToPageVo(
      list,
      total,
      filter.pageNum || 1,
      filter.pageSize || 10
    );
  }

  @Get("list")
  @Response()
  async list(@Query() filter: GoalListFilterDto) {
    const goalList = await this.goalService.findAll(filter);
    return GoalMapper.dtoToListVo(goalList);
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const goal = await this.goalService.findById(id);
    return GoalMapper.dtoToVo(goal);
  }
}
