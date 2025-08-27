import { BaseModelVo } from "../../base/model.vo";
import { TodoVo } from "../todo/todo-model.vo";
import { RepeatVo } from "@life-toolkit/components-repeat/vo";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

export type TodoRepeatModelVo = {
  /** 模板名称 */
  name?: string;

  /** 模板描述 */
  description?: string;

  /** 模板重要程度 */
  importance?: number;

  /** 模板紧急程度 */
  urgency?: number;

  /** 模板标签 */
  tags?: string[];

  /** 来源 */
  source?: TodoSource;

  /** 开始时间（日期时间） */
  startAt?: string;

  /** 结束时间（日期时间） */
  endAt?: string;

  /** 状态（模板整体状态） */
  status?: TodoStatus;

  /** 完成时间 */
  doneAt?: string;

  /** 放弃时间 */
  abandonedAt?: string;
};

export type TodoRepeatItemVo = BaseModelVo & TodoRepeatModelVo & RepeatVo;

export type TodoRepeatVo = TodoRepeatItemVo & {
  /** 关联的待办列表 */
  todos?: TodoVo[];
};
