import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Todo } from "./entities/todo.entity";
import { TodoStatus } from "./entities";
import { In } from "typeorm";

@Injectable()
export class TodoStatusService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {}

  private async updateStatus(
    id: string,
    status: TodoStatus,
    dateField: keyof Todo
  ): Promise<boolean> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.todoRepository.update(id, {
      status,
      [dateField]: new Date(),
    });

    return true;
  }

  async batchDone(
    idList: string[]
  ): Promise<{ id: string; result: boolean }[]> {
    const todos = await this.todoRepository.findBy({
      id: In(idList),
    });
    const updatedTodos = await Promise.all(
      todos.map(async (todo) => {
        await this.updateStatus(todo.id, TodoStatus.DONE, "doneAt");

        return {
          id: todo.id,
          result: true,
        };
      })
    );

    return updatedTodos;
  }

  async abandon(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.ABANDONED, "abandonedAt");
  }

  async restore(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.TODO, "updatedAt");
  }
}
