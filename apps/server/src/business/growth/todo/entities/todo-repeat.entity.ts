import { Entity, OneToMany } from "typeorm";
import { Todo } from "./todo.entity";
import { Repeat } from "@life-toolkit/components-repeat/server/entity";

@Entity("todo_repeat")
export class TodoRepeat extends Repeat {
  /** 关联的待办 */
  @OneToMany(() => Todo, (todo) => todo.repeat)
  todo: Todo;
}
