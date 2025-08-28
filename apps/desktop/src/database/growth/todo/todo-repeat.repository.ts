import { Repository, In } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
  TodoRepeat,
} from "@life-toolkit/business-server";

export class TodoRepeatRepository {
  private repo: Repository<TodoRepeat> =
    AppDataSource.getRepository(TodoRepeat);

  private buildQuery(filter: TodoRepeatListFilterDto) {
    const qb = this.repo
      .createQueryBuilder("todoRepeat")
      .leftJoinAndSelect("todoRepeat.todos", "todos");

    if (filter.status !== undefined) {
      qb.andWhere("todoRepeat.status = :status", { status: filter.status });
    }
    if (filter.importance !== undefined) {
      qb.andWhere("todoRepeat.importance = :importance", {
        importance: filter.importance,
      });
    }
    if (filter.urgency !== undefined) {
      qb.andWhere("todoRepeat.urgency = :urgency", { urgency: filter.urgency });
    }
    if (filter.keyword) {
      qb.andWhere("todoRepeat.name LIKE :kw", { kw: `%${filter.keyword}%` });
    }
    if (filter.currentDateStart) {
      qb.andWhere("todoRepeat.currentDate >= :cds", {
        cds: filter.currentDateStart,
      });
    }
    if (filter.currentDateEnd) {
      qb.andWhere("todoRepeat.currentDate <= :cde", {
        cde: filter.currentDateEnd,
      });
    }
    if (filter.abandonedDateStart) {
      qb.andWhere("todoRepeat.abandonedAt >= :ads", {
        ads: filter.abandonedDateStart,
      });
    }
    if (filter.abandonedDateEnd) {
      qb.andWhere("todoRepeat.abandonedAt <= :ade", {
        ade: filter.abandonedDateEnd,
      });
    }

    return qb;
  }

  async create(createDto: CreateTodoRepeatDto): Promise<TodoRepeatDto> {
    const entity = createDto.exportCreateEntity();
    const saved = await this.repo.save(entity);

    const dto = new TodoRepeatDto();
    dto.importEntity(saved);
    return dto;
  }

  async findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.orderBy("todoRepeat.createdAt", "DESC").getMany();
    return list.map((item) => {
      const dto = new TodoRepeatDto();
      dto.importEntity(item);
      return dto;
    });
  }

  async page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeatDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);

    const [list, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .orderBy("todoRepeat.createdAt", "DESC")
      .getManyAndCount();

    return {
      list: list.map((item) => {
        const dto = new TodoRepeatDto();
        dto.importEntity(item);
        return dto;
      }),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(
    id: string,
    updateDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error("TodoRepeat not found");

    updateDto.importUpdateEntity(entity);
    updateDto.exportUpdateEntity();
    const saved = await this.repo.save(entity);
    const dto = new TodoRepeatDto();
    dto.importEntity(saved);
    return dto;
  }

  async batchUpdate(
    idList: string[],
    updateDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto[]> {
    const entities = await this.repo.find({ where: { id: In(idList) } });

    entities.forEach((entity) => {
      updateDto.exportUpdateEntity();
    });

    const saved = await this.repo.save(entities);
    return saved.map((item) => {
      const dto = new TodoRepeatDto();
      dto.importEntity(item);
      return dto;
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  async deleteByFilter(filter: TodoRepeatPageFiltersDto): Promise<void> {
    const qb = this.repo.createQueryBuilder("todoRepeat");

    // 根据过滤条件构建删除查询
    if (filter.status !== undefined) {
      qb.andWhere("todoRepeat.status = :status", { status: filter.status });
    }

    const list = await qb.getMany();
    if (list.length) await this.repo.delete(list.map((x) => x.id));
  }

  async softDelete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (entity) {
      await this.repo.softRemove(entity);
    }
  }

  async batchSoftDelete(idList: string[]): Promise<void> {
    const entities = await this.repo.find({ where: { id: In(idList) } });
    if (entities.length) {
      await this.repo.softRemove(entities);
    }
  }

  async findById(id: string, relations?: string[]): Promise<TodoRepeatDto> {
    const todoRepeat = await this.repo.findOne({
      where: { id },
      relations: relations ?? ["todos"],
    });
    if (!todoRepeat) throw new Error("TodoRepeat not found");
    const dto = new TodoRepeatDto();
    dto.importEntity(todoRepeat);
    return dto;
  }

  async findOneBy(condition: any): Promise<TodoRepeatDto | null> {
    const todoRepeat = await this.repo.findOne({ where: condition });
    if (!todoRepeat) return null;
    const dto = new TodoRepeatDto();
    dto.importEntity(todoRepeat);
    return dto;
  }
}
