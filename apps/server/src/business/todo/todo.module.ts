import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo, SubTodo } from "./entities";
import { TodoController } from "./todo/todo.controller";
import { TodoService } from "./todo/todo.service";
import { SubTodoController } from "./sub-todo/sub-todo.controller";
import { SubTodoService } from "./sub-todo/sub-todo.service";
import { TodoStatusService } from "./todo-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([Todo, SubTodo])],
  controllers: [TodoController, SubTodoController],
  providers: [TodoService, SubTodoService, TodoStatusService],
  exports: [TodoService, SubTodoService, TodoStatusService],
})
export class TodoModule {}
