import { Injectable, BadRequestException } from "@nestjs/common";
import { GoalRepository } from "./goal.repository";
import { GoalTreeRepository } from "./goal-tree.repository";
import { GoalService as GoalServiceBase } from "@life-toolkit/business-server";

@Injectable()
export class GoalService extends GoalServiceBase {
  constructor(
    readonly goalRepository: GoalRepository,
    readonly goalTreeRepository: GoalTreeRepository
  ) {
    super(goalRepository, goalTreeRepository);
  }
}
