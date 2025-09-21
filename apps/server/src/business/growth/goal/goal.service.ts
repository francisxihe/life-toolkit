import { Injectable, BadRequestException } from '@nestjs/common';
import { GoalRepository } from './goal.repository';
import { GoalTreeRepository } from './goal-tree.repository';
import { GoalService as _GoalService } from '@life-toolkit/business-server';

@Injectable()
export class GoalService extends _GoalService {
  constructor(
    readonly goalRepository: GoalRepository,
    readonly goalTreeRepository: GoalTreeRepository
  ) {
    super(goalRepository, goalTreeRepository);
  }
}
