import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Ref,
} from "@mikro-orm/core";
import { BaseTodoEntity } from "./base.entity";
import { Todo } from "./todo.entity";

@Entity({ tableName: "sub_todo" })
export class SubTodo extends BaseTodoEntity {
  /** 父待办id */
  @Property()
  parentId: string;

  /** 子待办列表 */
  @OneToMany({
    entity: () => SubTodo,
    mappedBy: "parentSubTodo",
  })
  subTodoList = new Collection<SubTodo>(this);

  /** 父级SubTodo */
  @ManyToOne({
    entity: () => SubTodo,
    inversedBy: "subTodoList",
  })
  parentSubTodo?: Ref<SubTodo>;

  /** 关联的顶级Todo */
  @ManyToOne({
    entity: () => Todo,
    inversedBy: "subTodoList",
  })
  parentTodo?: Ref<Todo>;
}
