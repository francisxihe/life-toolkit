import type {
  Goal as GoalVO,
  GoalListFiltersVo,
  GoalPageFiltersVo,
} from "@life-toolkit/vo";
import {
  GoalListFiltersDto,
  GoalPageFiltersDto,
  CreateGoalDto,
  UpdateGoalDto,
  GoalDto,
} from "@life-toolkit/business-server";
import { GoalService } from "./goal.service";
import { Controller } from "@business/decorators";

@Controller("/goal")
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  async create(createGoalVo: GoalVO.CreateGoalVo) {
    const createDto = CreateGoalDto.importVo(createGoalVo);
    const dto = await this.goalService.create(createDto);
    return dto.exportModelVo();
  }

  async findById(id: string) {
    const dto = await this.goalService.findById(id);
    return dto.exportVo();
  }

  async update(id: string, updateGoalVo: GoalVO.UpdateGoalVo) {
    const updateDto = UpdateGoalDto.importVo(updateGoalVo);
    const dto = await this.goalService.update(id, updateDto);
    return dto.exportVo();
  }

  async remove(id: string) {
    return await this.goalService.delete(id);
  }

  async page(goalPageFiltersVo?: GoalPageFiltersVo) {
    const goalPageFilterDto = new GoalPageFiltersDto();
    goalPageFilterDto.importPageVo(goalPageFiltersVo ?? {});
    const { list, total, pageNum, pageSize } =
      await this.goalService.page(goalPageFilterDto);
    return GoalDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  async list(goalListFiltersVo?: GoalListFiltersVo) {
    const goalListFiltersDto = new GoalListFiltersDto();
    goalListFiltersDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.list(goalListFiltersDto);
    return GoalDto.dtoListToListVo(list);
  }

  async tree(goalListFiltersVo?: GoalListFiltersVo) {
    const goalListFiltersDto = new GoalListFiltersDto();
    goalListFiltersDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.getTree(goalListFiltersDto);
    return list.map((dto) => dto.exportVo());
  }

  async findRoots() {
    return (await this.goalService.findRoots()).map((dto) => dto.exportVo());
  }

  async findDetail(id: string) {
    const dto = await this.goalService.findDetail(id);
    return dto.exportVo();
  }

  async abandon(id: string) {
    return await this.goalService.abandon(id);
  }

  async restore(id: string) {
    return await this.goalService.restore(id);
  }
}
