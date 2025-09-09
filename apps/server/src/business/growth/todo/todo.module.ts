import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo, TodoRepeat } from '@life-toolkit/business-server';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoRepeatService } from './todo-repeat.service';
import { TodoStatusService } from './todo-status.service';
import { TodoRepository } from './todo.repository';
@Module({
  imports: [TypeOrmModule.forFeature([Todo, TodoRepeat])],
  controllers: [TodoController],
  providers: [TodoService, TodoRepeatService, TodoStatusService, TodoRepository],
  exports: [TodoService, TodoRepeatService, TodoStatusService, TodoRepository],
})
export class TodoModule {}
