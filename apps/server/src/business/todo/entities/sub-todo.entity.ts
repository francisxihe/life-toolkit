import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { BaseTodoEntity } from "./base.entity";
import { Todo } from "./todo.entity";

@Entity("sub_todo")
export class SubTodo extends BaseTodoEntity {
  /** 父待办id */
  @Column()
  parentId: string;

  /** 子待办列表 */
  @OneToMany(() => SubTodo, (subTodo) => subTodo.parentSubTodo)
  subTodoList: SubTodo[];

  /** 父级SubTodo */
  @ManyToOne(() => SubTodo, (subTodo) => subTodo.subTodoList)
  @JoinColumn({ name: "parentId" })
  parentSubTodo: SubTodo;

  /** 关联的顶级Todo */
  @ManyToOne(() => Todo, (todo) => todo.subTodoList)
  @JoinColumn({ name: "parentId" })
  parentTodo: Todo;
}
