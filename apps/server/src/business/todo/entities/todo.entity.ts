import { Entity, Column, OneToMany } from "typeorm";
import { BaseTodoEntity } from "./base.entity";
import { SubTodo } from "./sub-todo.entity";
import { TodoRepeat } from "./enum";
@Entity("todo")
export class Todo extends BaseTodoEntity {
  /** 计划待办日期 */
  @Column("date")
  planDate: Date;

  /** 重复类型 */
  @Column({ nullable: true })
  repeat?: TodoRepeat;

  /** 待办重复间隔 */
  @Column({ nullable: true })
  repeatInterval?: string;

  /** 子待办 */
  @OneToMany(() => SubTodo, (subTodo) => subTodo.parentTodo)
  subTodoList: SubTodo[];
}
