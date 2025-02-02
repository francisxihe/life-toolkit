export type GetTodoListParams = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: Todo['importance'];
  urgency?: Todo['urgency'];
  status?: Todo['status'];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
};

export interface Todo {
  id: string;
  /** 待办名称 */
  name: string;
  /** 待办描述 */
  description?: string;
  /** 待办重要程度 */
  importance?: number;
  /** 待办紧急程度 */
  urgency?: number;
  /** 待办标签 */
  tags: string[];
  /** 待办完成时间 */
  doneAt?: string;
  /** 计划待办日期 */
  planDate?: string;
  /** 计划待办开始时间 */
  planStartAt?: string;
  /** 计划待办结束时间 */
  planEndAt?: string;
  /** 待办创建时间 */
  createdAt: string;
  /** 待办是否是重复待办 */
  recurring?: string;
  /** 放弃待办时间 */
  abandonedAt?: string;
  /** 待办状态 */
  status: 'todo' | 'done' | 'abandoned';
}

export interface SubTodo {
  id: string;
  /** 待办名称 */
  name: string;
  /** 待办描述 */
  description?: string;
  /** 待办重要程度 */
  importance?: number;
  /** 待办紧急程度 */
  urgency?: number;
  /** 待办标签 */
  tags: string[];
  /** 待办完成时间 */
  doneAt?: string;
  /** 计划待办开始时间 */
  planStartAt?: string;
  /** 计划待办结束时间 */
  planEndAt?: string;
  /** 待办创建时间 */
  createdAt: string;
  /** 放弃待办时间 */
  abandonedAt?: string;
  /** 待办状态 */
  status: 'todo' | 'done' | 'abandoned';
  /** 父待办id */
  parentId: string;
}

export interface TodoNode extends Todo {
  subTodoList: SubTodoNode[];
}

export interface SubTodoNode extends SubTodo {
  subTodoList: SubTodoNode[];
}
