import { Entity, Column, OneToMany } from "typeorm";
import { BaseTodoEntity } from "./base.entity";

@Entity("sub_todo")
export class SubTodo extends BaseTodoEntity {
  /** 父待办id */
  @Column()
  parentId: string;

  /** 子待办 */
  @OneToMany(() => SubTodo, (subTodo) => subTodo.parentId)
  subTodoList: SubTodo[];
}
