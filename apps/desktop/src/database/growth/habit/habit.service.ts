import { HabitRepository } from "./habit.repository";
import { HabitService as _HabitService } from "@life-toolkit/business-server";

export class HabitService extends _HabitService {
  constructor() {
    const repo = new HabitRepository();
    super(repo);
  }
}

export const habitService = new HabitService();
