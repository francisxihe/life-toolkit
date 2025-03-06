import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo } from "./entities";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { TodoStatusService } from "./todo-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodoController],
  providers: [TodoService, TodoStatusService],
  exports: [TodoService, TodoStatusService],
})
export class TodoModule {}
