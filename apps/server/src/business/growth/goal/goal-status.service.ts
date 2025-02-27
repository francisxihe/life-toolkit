import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { GoalStatus, Goal } from "./entities";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";
@Injectable()
export class GoalStatusService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) {}

  private async updateStatus(
    id: string,
    status: GoalStatus,
    dateField: keyof Goal
  ): Promise<boolean> {
    const goal = await this.goalRepository.findOneBy({ id });
    if (!goal) {
      throw new Error("Goal not found");
    }

    await this.goalRepository.update(id, {
      status,
      [dateField]: new Date(),
    });

    return true;
  }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    await this.goalRepository.update(
      { id: In(params.idList) },
      {
        status: GoalStatus.DONE,
        doneAt: new Date(),
      }
    );

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<boolean> {
    return this.updateStatus(id, GoalStatus.ABANDONED, "abandonedAt");
  }

  async restore(id: string): Promise<boolean> {
    return this.updateStatus(id, GoalStatus.TODO, "updatedAt");
  }
}
