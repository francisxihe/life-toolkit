import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo, TodoRepeat } from "./entities";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { TodoRepeatService } from "./todo-repeat.service";
import { TodoStatusService } from "./todo-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([Todo, TodoRepeat])],
  controllers: [TodoController],
  providers: [TodoService, TodoRepeatService, TodoStatusService],
  exports: [TodoService, TodoRepeatService, TodoStatusService],
})
export class TodoModule {}
