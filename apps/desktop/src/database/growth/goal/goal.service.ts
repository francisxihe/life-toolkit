import { GoalService as _GoalService } from "@life-toolkit/business-server";
import { GoalRepository } from "./goal.repository";
import { GoalTreeRepository } from "./goal-tree.repository";

export default class GoalService extends _GoalService {
  constructor() {
    const repo = new GoalRepository();
    const treeRepo = new GoalTreeRepository();
    super(repo, treeRepo);
  }
}

export const goalService = new GoalService();
