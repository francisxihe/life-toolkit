import { AiCapabilityKey } from '@true-north/enum';
import type {
  GoalDecomposeRequestVo,
  GoalDecomposeResponseVo,
  TaskDecomposeRequestVo,
  TaskDecomposeResponseVo,
} from '@true-north/vo';
import { goalDecomposeCapability } from './goal-decompose.capability';
import { taskDecomposeCapability } from './task-decompose.capability';

type AnyCapability = {
  key: string;
  execute(input: any): Promise<any>;
};

const capabilities = new Map<string, AnyCapability>([
  [AiCapabilityKey.GOAL_DECOMPOSE, goalDecomposeCapability],
  [AiCapabilityKey.TASK_DECOMPOSE, taskDecomposeCapability],
]);

export class CapabilityRegistry {
  getGoalDecompose() {
    return capabilities.get(AiCapabilityKey.GOAL_DECOMPOSE)! as {
      key: string;
      execute(input: GoalDecomposeRequestVo): Promise<GoalDecomposeResponseVo>;
    };
  }

  getTaskDecompose() {
    return capabilities.get(AiCapabilityKey.TASK_DECOMPOSE)! as {
      key: string;
      execute(input: TaskDecomposeRequestVo): Promise<TaskDecomposeResponseVo>;
    };
  }
}

export const capabilityRegistry = new CapabilityRegistry();
