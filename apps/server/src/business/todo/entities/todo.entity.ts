import { Entity, Column, OneToMany } from "typeorm";
import { BaseTodoEntity } from "./base.entity";
import { SubTodo } from "./sub-todo.entity";

export enum TodoRepeat {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export const TodoRepeatMeta = {
  description: "重复类型",
  enum: TodoRepeat,
  enumName: "TodoRepeat",
  default: TodoRepeat.NONE,
} as const;

@Entity("todo")
export class Todo extends BaseTodoEntity {
  /** 计划待办日期 */
  @Column("date")
  planDate: Date;

  @Column({ nullable: true })
  repeat?: TodoRepeat;

  /** 待办重复间隔 */
  @Column({ nullable: true })
  repeatInterval?: string;

  /** 子待办 */
  @OneToMany(() => SubTodo, (subTodo) => subTodo.parentId)
  subTodoList?: SubTodo[];
}
