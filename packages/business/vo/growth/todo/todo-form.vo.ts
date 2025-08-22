import { TodoModelVo } from "./todo-model.vo";
import {
  CreateRepeatVo,
  UpdateRepeatVo,
} from "@life-toolkit/components-repeat/vo";

export type CreateTodoVo = Omit<
  TodoModelVo,
  "doneAt" | "abandonedAt" | "status" | "repeat"
> & {
  taskId?: string;
  repeat?: CreateRepeatVo;
};

export type UpdateTodoVo = Partial<Omit<CreateTodoVo, "repeat">> & {
  repeat?: UpdateRepeatVo;
};
