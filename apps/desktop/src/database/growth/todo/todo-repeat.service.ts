import { TodoRepeatService as _TodoRepeatService } from "@life-toolkit/business-server";
import { TodoRepeatRepository } from "./todo-repeat.repository";

export class TodoRepeatService extends _TodoRepeatService {
  constructor() {
    const todoRepeatRepository = new TodoRepeatRepository();
    super(todoRepeatRepository);
  }
}
 
export const todoRepeatService = new TodoRepeatService();
 