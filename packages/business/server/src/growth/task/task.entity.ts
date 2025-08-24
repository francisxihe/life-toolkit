import { BaseEntity } from "../../base/base.entity";
import { TaskStatus } from "@life-toolkit/enum";
import { Goal } from "../goal/goal.entity";
import { Todo } from "../todo/todo.entity";

export class Task extends BaseEntity {
  /** 任务名称 */
  name!: string;

  /** 任务事项状态 */
  status!: TaskStatus;

  /** 任务预估时间 */
  estimateTime?: string;

  /** 任务跟踪时间ID列表 */
  trackTimeIds!: string[];

  /** 任务描述 */
  description?: string;

  /** 任务重要程度 */
  importance?: number;

  /** 任务紧急程度 */
  urgency?: number;

  /** 任务标签 */
  tags!: string[];

  /** 任务完成时间 */
  doneAt?: Date;

  /** 放弃任务时间 */
  abandonedAt?: Date;

  /** 计划任务开始时间 */
  startAt?: Date;

  /** 计划任务结束时间 */
  endAt?: Date;

  /** 父任务 */
  parent?: Task;

  /** 子任务 */
  children!: Task[];

  /** 任务事项列表 */
  todoList?: Todo[];

  /** 目标 */
  goal?: Goal;

  /** 目标ID */
  goalId?: string;
}
