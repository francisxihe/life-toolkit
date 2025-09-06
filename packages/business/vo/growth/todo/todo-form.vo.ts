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
  /** 关联的重复配置ID，优先于嵌套的 repeat */
  repeatId?: string;
  repeat?: CreateRepeatVo;
};

export type UpdateTodoVo = Partial<Omit<CreateTodoVo, "repeat">> & {
  repeat?: UpdateRepeatVo;
};
