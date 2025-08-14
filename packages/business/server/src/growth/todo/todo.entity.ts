import { BaseEntity } from "../../base/base.entity";
import { TodoStatus } from "./todo.enum";
import { Task } from "../task";
import { TodoRepeat } from "./todo-repeat.entity";

export enum TodoSource {
  /** 手动创建 */
  MANUAL = "manual",
  /** 重复创建 */
  REPEAT = "repeat",
  /** 习惯创建 */
  HABIT = "habit",
}

export class Todo extends BaseEntity {
  name!: string;

  status!: TodoStatus;
  description?: string;
  importance?: number;

  /** 待办紧急程度 */
  urgency?: number;

  /** 待办标签 */
  tags!: string[];

  /** 待办完成时间 */
  doneAt?: Date;

  /** 放弃待办时间 */
  abandonedAt?: Date;

  /** 计划待办开始时间 */
  planStartAt?: string;

  /** 计划待办结束时间 */
  planEndAt?: string;

  /** 计划待办日期 */
  planDate: Date = new Date();

  /** 关联的任务 */
  task?: Task;

  /** 任务ID */
  taskId?: string;

  /** 重复配置 */
  repeat?: TodoRepeat;

  /** 重复配置ID */
  repeatId?: string;

  /** 原始重复配置ID（用于保留关联记录） */
  originalRepeatId?: string;

  /** 关联的习惯 */
  habit?: any;

  /** 习惯ID */
  habitId?: string;

  /** 来源 */
  source?: TodoSource;
}
