import { TodoRepeatVo, TodoRepeatItemVo } from "./todo-repeat-model.vo";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

export type TodoRepeatListFiltersVo = Partial<
  Pick<TodoRepeatVo, "importance" | "urgency" | "status" | "source"> & {
    keyword?: string;
    startDateStart?: string;
    startDateEnd?: string;
    endDateStart?: string;
    endDateEnd?: string;
    doneDateStart?: string;
    doneDateEnd?: string;
    abandonedDateStart?: string;
    abandonedDateEnd?: string;
  }
>;

export type TodoRepeatPageFiltersVo = TodoRepeatListFiltersVo & {
  pageNum?: number;
  pageSize?: number;
};

export type TodoRepeatListVo = {
  list: TodoRepeatItemVo[];
};

export type TodoRepeatPageVo = {
  list: TodoRepeatItemVo[];
  total: number;
  pageNum: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};
