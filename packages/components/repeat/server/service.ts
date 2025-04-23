import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Repeat } from "./entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RepeatDto, CreateRepeatDto, UpdateRepeatDto } from "./dto";
import { calculateNextDate } from "../common/calculateNextDate";

// 添加dayjs插件
dayjs.extend(isBetween);

@Injectable()
export class RepeatService {
  constructor(
    @InjectRepository(Repeat)
    private readonly repeatRepository: Repository<Repeat>
  ) {}

  async create(createRepeatDto: CreateRepeatDto): Promise<RepeatDto> {
    const repeat = this.repeatRepository.create({
      ...createRepeatDto,
    });

    await this.repeatRepository.save(repeat);

    return {
      ...repeat,
    };
  }

  async update(
    id: string,
    updateRepeatDto: UpdateRepeatDto
  ): Promise<RepeatDto> {
    const repeat = await this.repeatRepository.findOneBy({ id });
    if (!repeat) {
      throw new Error("Repeat not found");
    }

    await this.repeatRepository.update(id, {
      ...updateRepeatDto,
    });

    return this.findById(id);
  }

  async findById(id: string): Promise<RepeatDto> {
    const repeat = await this.repeatRepository.findOneBy({ id });
    if (!repeat) {
      throw new Error("Repeat not found");
    }

    return {
      ...repeat,
    };
  }

  /**
   * 根据重复配置计算下一个日期
   */
  calculateNextDate(currentDate: Dayjs, repeat: Repeat): Dayjs | null {
    return calculateNextDate(currentDate, repeat);
  }
}
