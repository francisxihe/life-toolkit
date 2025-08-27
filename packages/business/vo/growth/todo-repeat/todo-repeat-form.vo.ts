import { TodoRepeatModelVo } from "./todo-repeat-model.vo";
import {
  CreateRepeatVo,
  UpdateRepeatVo,
} from "@life-toolkit/components-repeat/vo";

export type CreateTodoRepeatVo = Omit<
  TodoRepeatModelVo,
  "doneAt" | "abandonedAt" | "status"
> & CreateRepeatVo;

export type UpdateTodoRepeatVo = Partial<CreateTodoRepeatVo> & UpdateRepeatVo;
