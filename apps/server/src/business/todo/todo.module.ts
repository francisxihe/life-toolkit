import { Module } from "@nestjs/common";
import { Todo, SubTodo } from "./entities";
import { TodoController } from "./todo/todo.controller";
import { TodoService } from "./todo/todo.service";
import { SubTodoController } from "./sub-todo/sub-todo.controller";
import { SubTodoService } from "./sub-todo/sub-todo.service";
import { TodoStatusService } from "./todo-status.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [MikroOrmModule.forFeature([Todo, SubTodo])],
  controllers: [TodoController, SubTodoController],
  providers: [TodoService, SubTodoService, TodoStatusService],
  exports: [TodoService, SubTodoService, TodoStatusService],
})
export class TodoModule {}
