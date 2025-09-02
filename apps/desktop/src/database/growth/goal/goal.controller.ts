import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@life-toolkit/electron-ipc-router";
import type {
  Goal as GoalVO,
} from "@life-toolkit/vo";
import { GoalController as _GoalController } from "@life-toolkit/business-server";
import { goalService } from "./goal.service";

@Controller("/goal")
export class GoalController {
}
