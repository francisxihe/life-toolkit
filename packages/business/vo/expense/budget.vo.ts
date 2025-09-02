import { BaseModelVo } from "../common/model.vo";

export interface BudgetModelVo {
  category: string;
  amount: number;
  period: "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  spent: number;
}

export type BudgetVo = BaseModelVo & BudgetModelVo;


export type CreateBudgetVo = Omit<BudgetModelVo, "spent">;
