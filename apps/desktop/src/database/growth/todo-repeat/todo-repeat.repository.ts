import { Repository, In } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
  TodoRepeatMapper,
  TodoRepeat,
} from "@life-toolkit/business-server";
import { TodoStatus, TodoSource } from "@life-toolkit/enum";

export class TodoRepeatRepository {
  private repo: Repository<TodoRepeat> = AppDataSource.getRepository(TodoRepeat);

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
    if (filter.source !== undefined) {
      qb.andWhere("todoRepeat.source = :source", { source: filter.source });
    }
    if (filter.keyword) {
      qb.andWhere("todoRepeat.name LIKE :kw", { kw: `%${filter.keyword}%` });
    }
    if (filter.startDateStart) {
      qb.andWhere("todoRepeat.startAt >= :sds", { sds: filter.startDateStart });
    }
    if (filter.startDateEnd) {
      qb.andWhere("todoRepeat.startAt <= :sde", { sde: filter.startDateEnd });
    }
    if (filter.endDateStart) {
      qb.andWhere("todoRepeat.endAt >= :eds", { eds: filter.endDateStart });
    }
    if (filter.endDateEnd) {
      qb.andWhere("todoRepeat.endAt <= :ede", { ede: filter.endDateEnd });
    }
    if (filter.doneDateStart) {
      qb.andWhere("todoRepeat.doneAt >= :dds", { dds: filter.doneDateStart });
    }
    if (filter.doneDateEnd) {
      qb.andWhere("todoRepeat.doneAt <= :dde", { dde: filter.doneDateEnd });
    }
    if (filter.abandonedDateStart) {
      qb.andWhere("todoRepeat.abandonedAt >= :ads", {
        ads: filter.abandonedDateStart,
      });
    }
    if (filter.abandonedDateEnd) {
      qb.andWhere("todoRepeat.abandonedAt <= :ade", { ade: filter.abandonedDateEnd });
    }

    return qb;
  }

  async create(createDto: CreateTodoRepeatDto): Promise<TodoRepeatDto> {
    const entity = this.repo.create();
    createDto.applyToCreateEntity(entity);
    const saved = await this.repo.save(entity);
    return TodoRepeatMapper.entityToDto(saved);
  }

  async createWithExtras(
    createDto: CreateTodoRepeatDto,
    extras: Partial<TodoRepeat>
  ): Promise<TodoRepeatDto> {
    const entity = this.repo.create();
    createDto.applyToCreateEntity(entity);
    Object.assign(entity, extras);
    const saved = await this.repo.save(entity);
    return TodoRepeatMapper.entityToDto(saved);
  }

  async findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.orderBy("todoRepeat.createdAt", "DESC").getMany();
    return list.map((item) => TodoRepeatMapper.entityToDto(item));
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
      list: list.map((item) => TodoRepeatMapper.entityToDto(item)),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateDto: UpdateTodoRepeatDto): Promise<TodoRepeatDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error("TodoRepeat not found");

    updateDto.applyToUpdateEntity(entity);
    const saved = await this.repo.save(entity);
    return TodoRepeatMapper.entityToDto(saved);
  }

  async batchUpdate(
    idList: string[],
    updateDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto[]> {
    const entities = await this.repo.find({ where: { id: In(idList) } });
    
    entities.forEach(entity => {
      updateDto.applyToUpdateEntity(entity);
    });
    
    const saved = await this.repo.save(entities);
    return saved.map((item) => TodoRepeatMapper.entityToDto(item));
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
    if (filter.source !== undefined) {
      qb.andWhere("todoRepeat.source = :source", { source: filter.source });
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
    return TodoRepeatMapper.entityToDto(todoRepeat);
  }

  async findOneBy(condition: any): Promise<TodoRepeatDto | null> {
    const todoRepeat = await this.repo.findOne({ where: condition });
    return todoRepeat ? TodoRepeatMapper.entityToDto(todoRepeat) : null;
  }
}
