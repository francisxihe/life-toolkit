import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo, TodoRepeat } from "./entities";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { TodoRepeatService } from "./todo-repeat.service";
import { TodoStatusService } from "./todo-status.service";
import { TodoBaseService } from "./todo-base.service";
@Module({
  imports: [TypeOrmModule.forFeature([Todo, TodoRepeat])],
  controllers: [TodoController],
  providers: [
    TodoService,
    TodoRepeatService,
    TodoStatusService,
    TodoBaseService,
  ],
  exports: [TodoService, TodoRepeatService, TodoStatusService, TodoBaseService],
})
export class TodoModule {}
