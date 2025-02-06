import { Entity, Column, OneToMany } from "typeorm";
import { BaseTodoEntity } from "./base.entity";
import { SubTodo } from "./sub-todo.entity";
import { ApiProperty } from "@nestjs/swagger";

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

  @ApiProperty(TodoRepeatMeta)
  @Column({ nullable: true, select: false })
  repeat: TodoRepeat;

  /** 待办重复间隔 */
  @Column({ nullable: true, select: false })
  repeatInterval: string;

  /** 子待办 */
  @OneToMany(() => SubTodo, (subTodo) => subTodo.parentId)
  subTodoList?: SubTodo[];
}
