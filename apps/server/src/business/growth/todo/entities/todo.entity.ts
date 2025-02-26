import { Entity, Column, OneToMany } from "typeorm";
import { BaseTodoEntity } from "./base.entity";
// import { SubTodo } from "./sub-todo.entity";
import { TodoRepeat } from "./enum";
import {
  IsEnum,
  IsOptional,
  IsISO8601,
} from "class-validator";

@Entity("todo")
export class Todo extends BaseTodoEntity {
  /** 计划待办日期 */
  @Column("date")
  @IsISO8601()
  planDate: Date;

  /** 重复类型 */
  @Column({
    type: "enum",
    enum: TodoRepeat,
    nullable: true,
  })
  @IsEnum(TodoRepeat)
  @IsOptional()
  repeat?: TodoRepeat;

  /** 待办重复间隔 */
  @Column({ nullable: true })
  @IsOptional()
  repeatInterval?: string;

  // /** 子待办 */
  // @OneToMany(() => SubTodo, (subTodo) => subTodo.parentTodo)
  // subTodoList: SubTodo[];
}
