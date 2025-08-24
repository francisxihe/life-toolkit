import { BaseEntity } from "../../base/base.entity";
import { GoalType, GoalStatus } from "@life-toolkit/enum";
import { Task } from "../task";

export class Goal extends BaseEntity {
  name!: string;

  type?: GoalType;

  status!: GoalStatus;

  startAt?: Date;

  endAt?: Date;

  description?: string;

  importance?: number;

  doneAt?: Date;

  abandonedAt?: Date;

  parent?: Goal;

  children!: Goal[];

  priority?: number;

  taskList!: Task[];
}
