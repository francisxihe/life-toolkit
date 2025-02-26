import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { TodoStatus, SubTodo, Todo } from "./entities";
import {
  OperationByIdListDto,
  OperationByIdListResultDto,
} from "@/common/operation";
@Injectable()
export class TodoStatusService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    // @InjectRepository(SubTodo)
    // private readonly subTodoRepository: Repository<SubTodo>
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

  // private async updateStatusSub(
  //   id: string,
  //   status: TodoStatus,
  //   dateField: keyof SubTodo
  // ): Promise<boolean> {
  //   const subTodo = await this.subTodoRepository.findOneBy({ id });
  //   if (!subTodo) {
  //     throw new Error("SubTodo not found");
  //   }

  //   await this.subTodoRepository.update(id, {
  //     status,
  //     [dateField]: new Date(),
  //   });

  //   return true;
  // }

  async batchDone(
    params: OperationByIdListDto
  ): Promise<OperationByIdListResultDto> {
    await this.todoRepository.update(
      { id: In(params.idList) },
      {
        status: TodoStatus.DONE,
        doneAt: new Date(),
      }
    );

    // await this.subTodoRepository.update(
    //   { id: In(params.idList) },
    //   {
    //     status: TodoStatus.DONE,
    //     doneAt: new Date(),
    //   }
    // );

    return {
      result: true,
    };
  }

  async abandon(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.ABANDONED, "abandonedAt");
  }

  async restore(id: string): Promise<boolean> {
    return this.updateStatus(id, TodoStatus.TODO, "updatedAt");
  }

  // async abandonSub(id: string): Promise<boolean> {
  //   return this.updateStatusSub(id, TodoStatus.ABANDONED, "abandonedAt");
  // }

  // async restoreSub(id: string): Promise<boolean> {
  //   return this.updateStatusSub(id, TodoStatus.TODO, "updatedAt");
  // }
}
