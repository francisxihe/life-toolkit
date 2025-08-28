import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { TodoRepeat } from "@life-toolkit/business-server";

// 添加dayjs插件
dayjs.extend(isBetween);

@Injectable()
export class TodoRepeatService {
  constructor(
    @InjectRepository(TodoRepeat)
    private readonly todoRepeatRepository: Repository<TodoRepeat>
  ) {}
}
