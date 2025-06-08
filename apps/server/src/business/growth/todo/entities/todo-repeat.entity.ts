import { Entity, OneToMany, ManyToOne, JoinColumn, Column } from "typeorm";
import { Todo } from "./todo.entity";
import { Repeat } from "@life-toolkit/components-repeat/server";

@Entity("todo_repeat")
export class TodoRepeat extends Repeat {
  /** 关联的待办列表 */
  @OneToMany(() => Todo, (todo) => todo.repeat, { nullable: true })
  todos?: Todo[];

  /** 关联的习惯ID */
  @Column({ nullable: true })
  habitId?: string;

  /** 关联的习惯 */
  @ManyToOne("Habit", "todoRepeats", { nullable: true })
  @JoinColumn({ name: "habitId" })
  habit?: any;
}
