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
import { GoalService } from "./goal.service";

export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  async create(createGoalVo: GoalVO.CreateGoalVo) {
    const dto = await this.goalService.create(
      GoalMapper.voToCreateDto(createGoalVo)
    );
    return GoalMapper.dtoToItemVo(dto);
  }

  async findById(id: string) {
    return GoalMapper.dtoToVo(await this.goalService.findById(id));
  }

  async update(id: string, updateGoalVo: GoalVO.UpdateGoalVo) {
    const dto = await this.goalService.update(
      id,
      GoalMapper.voToUpdateDto(updateGoalVo)
    );
    return GoalMapper.dtoToVo(dto);
  }

  async remove(id: string) {
    return await this.goalService.delete(id);
  }

  async page(goalPageFiltersVo?: GoalPageFiltersVo) {
    const goalPageFilterDto = new GoalPageFilterDto();
    goalPageFilterDto.importPageVo(goalPageFiltersVo ?? {});
    const { list, total, pageNum, pageSize } =
      await this.goalService.page(goalPageFilterDto);
    return GoalMapper.dtoToPageVo(list, total, pageNum, pageSize);
  }

  async list(goalListFiltersVo?: GoalListFiltersVo) {
    const goalListFilterDto = new GoalListFilterDto();
    goalListFilterDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.list(goalListFilterDto);
    return GoalMapper.dtoToListVo(list);
  }

  async tree(goalListFiltersVo?: GoalListFiltersVo) {
    const goalListFilterDto = new GoalListFilterDto();
    goalListFilterDto.importListVo(goalListFiltersVo ?? {});
    const list = await this.goalService.getTree(goalListFilterDto);
    return list.map((dto) => GoalMapper.dtoToVo(dto));
  }

  async findRoots() {
    return (await this.goalService.findRoots()).map((dto) =>
      GoalMapper.dtoToVo(dto)
    );
  }

  async findDetail(id: string) {
    return GoalMapper.dtoToVo(await this.goalService.findDetail(id));
  }

  async batchDone(body?: { idList?: string[] }) {
    await this.goalService.batchDone(body?.idList ?? []);
  }

  async abandon(id: string) {
    return await this.goalService.abandon(id);
  }

  async restore(id: string) {
    return await this.goalService.restore(id);
  }
}
