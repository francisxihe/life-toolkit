import { Entity, Property, PrimaryKey, OneToMany, Collection } from "@mikro-orm/core";
import { BaseTodoEntity } from "./base.entity";
import { SubTodo } from "./sub-todo.entity";
import { TodoRepeat } from "./enum";

@Entity({ tableName: "todo" })
export class Todo extends BaseTodoEntity {
  /** 计划待办日期 */
  @Property({ fieldName: "planDate", type: "date" })
  planDate: Date;

  /** 重复类型 */
  @Property({ fieldName: "repeat", nullable: true })
  repeat?: TodoRepeat;

  /** 待办重复间隔 */
  @Property({ fieldName: "repeatInterval", nullable: true })
  repeatInterval?: string;

  /** 子待办 */
  @OneToMany({
    entity: () => SubTodo,
    mappedBy: "parentTodo"
  })
  subTodoList = new Collection<SubTodo>(this);
}
