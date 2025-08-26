import { Entity, OneToMany } from "typeorm";
import { Todo } from "@life-toolkit/business-server";
import { Repeat } from "@life-toolkit/components-repeat/server";

@Entity("todo_repeat")
export class TodoRepeat extends Repeat {
  /** 关联的待办列表 */
  @OneToMany(() => Todo, (todo) => todo.repeat, { nullable: true })
  todos?: Todo[];
}
