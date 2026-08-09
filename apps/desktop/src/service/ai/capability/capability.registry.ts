import { AiCapabilityKey } from '@true-north/enum';
import type { GoalDecomposeRequestVo, GoalDecomposeResponseVo } from '@true-north/vo';
import { goalDecomposeCapability } from './goal-decompose.capability';

type AnyCapability = {
  key: string;
  execute(input: any): Promise<any>;
};

const capabilities = new Map<string, AnyCapability>([
  [AiCapabilityKey.GOAL_DECOMPOSE, goalDecomposeCapability],
]);

export class CapabilityRegistry {
  getGoalDecompose() {
    return capabilities.get(AiCapabilityKey.GOAL_DECOMPOSE)! as {
      key: string;
      execute(input: GoalDecomposeRequestVo): Promise<GoalDecomposeResponseVo>;
    };
  }
}

export const capabilityRegistry = new CapabilityRegistry();
