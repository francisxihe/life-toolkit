---
trigger: model_decision
description: 编写server Repository代码时
globs:
---

# Server Repository 实现规范

## 📋 概述

Server Repository 位于 `apps/server/src/business/{module}/` 目录中，负责实现 MySQL/PostgreSQL 数据库的数据访问逻辑，支持复杂查询、关联关系处理和事务管理。

## 🏗️ 基础架构

### 文件结构
```
apps/server/src/business/{module}/
└── {module}.repository.ts     # Server Repository 实现
```

### 导入规范
```typescript
// 1. 导入 NestJS 和 TypeORM 相关类
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/common";
import {
  Repository,
  FindOptionsWhere,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
} from "typeorm";

// 2. 导入 Business Layer Interface 和类型
import {
  CreateModuleDto,
  UpdateModuleDto,
  ModulePageFiltersDto,
  ModuleListFilterDto,
  ModuleDto,
  Module,
} from "@life-toolkit/business-server";

// 3. 导入工具类
import dayjs from "dayjs";

// 4. 导入枚举和类型
import { ModuleStatus } from "@life-toolkit/enum";
```

## 📋 实现规范

### 基础 Repository 实现
```typescript
@Injectable()
export class ModuleRepository {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>
  ) {}

  // 实现 Business Interface 中的方法
  async create(createDto: CreateModuleDto): Promise<ModuleDto> {
    const module = this.moduleRepository.create({
      ...createDto,
      status: ModuleStatus.PENDING,
      tags: createDto.tags || [],
      planDate: createDto.planDate
        ? dayjs(createDto.planDate).toDate()
        : undefined,
    });

    const saved = await this.moduleRepository.save(module);
    return ModuleDto.importEntity(saved);
  }

  async findOneByRepeatAndDate(
    relatedId: string,
    date: Date
  ): Promise<ModuleDto | null> {
    const day = dayjs(date);
    const start = new Date(day.format("YYYY-MM-DD") + "T00:00:00");
    const end = new Date(day.format("YYYY-MM-DD") + "T23:59:59");
    const existed = await this.moduleRepository.findOne({
      where: {
        relatedId,
        planDate: Between(start, end),
      },
    });
    return existed ? ModuleDto.importEntity(existed) : null;
  }

  async createWithExtras(
    createDto: CreateModuleDto,
    extras: Partial<Module>
  ): Promise<ModuleDto> {
    const resource = this.moduleRepository.create({
      ...createDto,
      ...extras,
      status: ModuleStatus.ACTIVE,
      tags: createDto.tags || [],
      planDate: createDto.planDate
        ? dayjs(createDto.planDate).format("YYYY-MM-DD")
        : undefined,
    });
    await this.moduleRepository.save(resource);
    return this.findById(resource.id);
  }

  async findByFilter(filter: ModuleListFilterDto): Promise<ModuleDto[]> {
    const resourceList = await this.moduleRepository.find({
      where: this.buildWhere(filter),
    });
    return resourceList as ModuleDto[];
  }

  async page(filter: ModulePageFiltersDto): Promise<{
    list: ModuleDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [resourceList, total] = await this.moduleRepository.findAndCount({
      where: this.buildWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: resourceList as ModuleDto[],
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateDto: UpdateModuleDto): Promise<ModuleDto> {
    const resource = await this.moduleRepository.findOneBy({ id });
    if (!resource) {
      throw new Error("Module not found");
    }

    await this.moduleRepository.update(id, {
      ...updateDto,
      planDate: updateDto.planDate
        ? dayjs(updateDto.planDate).toDate()
        : undefined,
    });

    return this.findById(id);
  }

  async batchUpdate(
    includeIds: string[],
    updateDto: UpdateModuleDto
  ): Promise<ModuleDto[]> {
    if (!includeIds || includeIds.length === 0) return [];

    await this.moduleRepository.update(
      { id: In(includeIds) },
      {
        ...updateDto,
        planDate: updateDto.planDate
          ? dayjs(updateDto.planDate).toDate()
          : undefined,
      }
    );

    const updated = await this.moduleRepository.find({
      where: { id: In(includeIds) },
    });
    return (updated as unknown as ModuleDto[]) || [];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.moduleRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByFilter(filter: ModulePageFiltersDto): Promise<void> {
    await this.moduleRepository.delete(this.buildWhere(filter));
  }

  async findById(id: string, relations?: string[]): Promise<ModuleDto> {
    try {
      const resource = await this.moduleRepository.findOne({
        where: { id },
        relations: relations || [],
      });
      if (!resource) {
        throw new Error("Module not found");
      }

      // 手动加载关联关系
      if (resource.relatedId) {
        const resourceWithRepeat = await this.moduleRepository.findOne({
          where: { id },
          relations: ["repeat"],
        });
        if (resourceWithRepeat?.repeat) {
          resource.repeat = resourceWithRepeat.repeat;
        }
      }

      return resource as ModuleDto;
    } catch (error) {
      console.error(error);
      throw new Error("Module not found");
    }
  }

  async updateRepeatId(id: string, relatedId: string): Promise<void> {
    await this.moduleRepository.update(id, { relatedId });
  }

  async softDeleteByRelatedIds(relatedIds: string[]): Promise<void> {
    if (!relatedIds || relatedIds.length === 0) return;
    await this.moduleRepository.softDelete({ relatedId: In(relatedIds) });
  }

  // 查询条件构建器
  private buildWhere(
    filter: ModulePageFiltersDto | ModuleListFilterDto
  ): FindOptionsWhere<Module> {
    const where: FindOptionsWhere<Module> = {};

    // 日期范围条件
    if (filter.planDateStart && filter.planDateEnd) {
      where.planDate = Between(
        new Date(filter.planDateStart + "T00:00:00"),
        new Date(filter.planDateEnd + "T23:59:59")
      );
    } else if (filter.planDateStart) {
      where.planDate = MoreThan(new Date(filter.planDateStart + "T00:00:00"));
    } else if (filter.planDateEnd) {
      where.planDate = LessThan(new Date(filter.planDateEnd + "T23:59:59"));
    }

    // 完成时间范围条件
    if (filter.doneDateStart && filter.doneDateEnd) {
      where.doneAt = Between(
        new Date(filter.doneDateStart + "T00:00:00"),
        new Date(filter.doneDateEnd + "T23:59:59")
      );
    } else if (filter.doneDateStart) {
      where.doneAt = MoreThan(new Date(filter.doneDateStart + "T00:00:00"));
    } else if (filter.doneDateEnd) {
      where.doneAt = LessThan(new Date(filter.doneDateEnd + "T23:59:59"));
    }

    // 关键词搜索条件
    if (filter.keyword) {
      where.name = Like(`%${filter.keyword}%`);
    }

    // 状态条件
    if (filter.status) {
      where.status = filter.status;
    }

    // 重要程度条件
    if (filter.importance) {
      where.importance = filter.importance;
    }

    // 紧急程度条件
    if (filter.urgency) {
      where.urgency = filter.urgency;
    }

    // 关联ID条件
    if (filter.relatedId) {
      where.relatedId = filter.relatedId;
    }

    // 关联IDs条件
    if (filter.relatedIds) {
      where.relatedId = In(filter.relatedIds);
    }

    return where;
  }
}
```

## 🎯 设计原则

### 1. 复杂查询支持
- 支持多表关联查询
- 实现复杂的过滤条件
- 优化数据库查询性能

### 2. 事务管理
- 支持数据库事务
- 确保数据一致性
- 处理并发访问控制

### 3. 关联关系处理
- 处理实体间的关联关系
- 支持懒加载和预加载
- 优化关联查询性能

## 📝 核心方法实现

### 创建方法实现
```typescript
async create(createDto: CreateModuleDto): Promise<ModuleDto> {
  // 1. 创建实体对象
  const resource = this.moduleRepository.create({
    ...createDto,
    status: ModuleStatus.ACTIVE,
    tags: createDto.tags || [],
    planDate: createDto.planDate
      ? dayjs(createDto.planDate).format("YYYY-MM-DD")
      : undefined,
  });

  // 2. 保存到数据库
  await this.moduleRepository.save(resource);

  // 3. 重新查询返回完整数据
  return this.findById(resource.id);
}
```

### 查询条件构建器
```typescript
private buildWhere(
  filter: ModulePageFiltersDto | ModuleListFilterDto
): FindOptionsWhere<Module> {
  const where: FindOptionsWhere<Module> = {};

  // 日期范围查询
  if (filter.planDateStart && filter.planDateEnd) {
    where.planDate = Between(
      new Date(filter.planDateStart + "T00:00:00"),
      new Date(filter.planDateEnd + "T23:59:59")
    );
  }

  // 关键词搜索
  if (filter.keyword) {
    where.name = Like(`%${filter.keyword}%`);
  }

  // 状态过滤
  if (filter.status) {
    where.status = filter.status;
  }

  // 关联查询
  if (filter.relatedId) {
    where.relatedId = filter.relatedId;
  }

  return where;
}
```

### 分页查询实现
```typescript
async page(filter: ModulePageFiltersDto): Promise<{
  list: ModuleDto[];
  total: number;
  pageNum: number;
  pageSize: number;
}> {
  const pageNum = filter.pageNum || 1;
  const pageSize = filter.pageSize || 10;

  // 1. 执行分页查询
  const [resourceList, total] = await this.moduleRepository.findAndCount({
    where: this.buildWhere(filter),
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
  });

  // 2. 返回分页结果
  return {
    list: resourceList as ModuleDto[],
    total,
    pageNum,
    pageSize,
  };
}
```

### 关联关系处理
```typescript
async findById(id: string, relations?: string[]): Promise<ModuleDto> {
  try {
    // 1. 查询基础数据
    const resource = await this.moduleRepository.findOne({
      where: { id },
      relations: relations || [],
    });

    if (!resource) {
      throw new Error("Module not found");
    }

    // 2. 手动加载特殊关联关系
    if (resource.relatedId) {
      const resourceWithRepeat = await this.moduleRepository.findOne({
        where: { id },
        relations: ["repeat"],
      });
      if (resourceWithRepeat?.repeat) {
        resource.repeat = resourceWithRepeat.repeat;
      }
    }

    return resource as ModuleDto;
  } catch (error) {
    console.error(error);
    throw new Error("Module not found");
  }
}
```

## 🔧 高级功能实现

### 事务管理
```typescript
// 使用事务确保数据一致性
async complexOperation(data: ComplexData): Promise<ModuleDto> {
  return await this.moduleRepository.manager.transaction(async (manager) => {
    // 1. 创建主资源
    const resource = await manager.create(Module, data.resource);
    await manager.save(resource);

    // 2. 创建关联资源
    const relatedModule = await manager.create(RelatedModule, {
      ...data.relatedModule,
      resourceId: resource.id,
    });
    await manager.save(relatedModule);

    // 3. 更新资源状态
    await manager.update(Module, resource.id, { status: ModuleStatus.COMPLETED });

    return this.findById(resource.id);
  });
}
```

### 复杂查询
```typescript
// 复杂多表关联查询
async findComplex(filter: ComplexFilter): Promise<ModuleDto[]> {
  const qb = this.moduleRepository
    .createQueryBuilder("resource")
    .leftJoinAndSelect("resource.relatedEntity", "related")
    .leftJoinAndSelect("resource.anotherEntity", "another")
    .leftJoinAndSelect("resource.categories", "category");

  // 构建复杂查询条件
  if (filter.categoryId) {
    qb.andWhere("category.id = :categoryId", { categoryId: filter.categoryId });
  }

  if (filter.statusList && filter.statusList.length > 0) {
    qb.andWhere("resource.status IN (:...statusList)", {
      statusList: filter.statusList
    });
  }

  // 添加聚合查询
  qb.select([
    "resource.id",
    "resource.name",
    "COUNT(related.id) as relatedCount"
  ])
  .groupBy("resource.id")
  .having("COUNT(related.id) > :minCount", { minCount: filter.minRelatedCount || 0 });

  return await qb.getMany();
}
```

## 🚀 性能优化

### 1. 查询优化
```typescript
// 使用索引优化查询
const resources = await this.moduleRepository.find({
  where: {
    status: ModuleStatus.ACTIVE,
    planDate: Between(startDate, endDate),
  },
  order: { createdAt: "DESC" },
  skip: (pageNum - 1) * pageSize,
  take: pageSize,
  // 缓存查询结果
  cache: true,
});
```

### 2. 批量操作优化
```typescript
// 分批处理大量数据
async batchProcess(items: ModuleDto[], batchSize: number = 100) {
  const results: ModuleDto[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await this.batchUpdate(
      batch.map(item => item.id),
      { status: ModuleStatus.PROCESSED }
    );
    results.push(...batchResults);
  }

  return results;
}
```

### 3. 连接池管理
```typescript
// 合理使用连接池
async findWithTimeout(filter: ModuleListFilterDto): Promise<ModuleDto[]> {
  return await Promise.race([
    this.moduleRepository.find({ where: this.buildWhere(filter) }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout")), 30000)
    ),
  ]);
}
```

## ✅ 检查清单

在实现 Server Repository 时，请确认：

### 基础结构
- [ ] 使用 `@Injectable()` 装饰器
- [ ] 使用 `@InjectRepository()` 注入 Repository
- [ ] 正确导入 Business Interface 和类型

### 实现规范
- [ ] 实现所有 Interface 定义的方法
- [ ] 正确处理日期格式转换 (dayjs)
- [ ] 使用 TypeORM 查询构建器
- [ ] 正确实现软删除逻辑

### 数据处理
- [ ] 正确处理 DTO 到 Entity 的转换
- [ ] 实现关联关系的加载
- [ ] 正确处理批量操作
- [ ] 确保数据类型一致性

### 性能优化
- [ ] 优化查询语句
- [ ] 合理使用索引
- [ ] 实现分页查询
- [ ] 使用事务确保数据一致性

### 错误处理
- [ ] 实现异常处理机制
- [ ] 提供有意义的错误信息
- [ ] 处理并发访问冲突
- [ ] 记录关键操作日志

## 📝 完整示例

```typescript
// apps/server/src/business/resource/resource.repository.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/common";
import {
  Repository,
  FindOptionsWhere,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
} from "typeorm";
import {
  CreateModuleDto,
  UpdateModuleDto,
  ModulePageFiltersDto,
  ModuleListFilterDto,
  ModuleDto,
  Module,
} from "@life-toolkit/business-server";
import dayjs from "dayjs";
import { ModuleStatus } from "@life-toolkit/enum";

@Injectable()
export class ModuleRepository {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>
  ) {}

  async create(createDto: CreateModuleDto): Promise<ModuleDto> {
    const resource = this.moduleRepository.create({
      ...createDto,
      status: ModuleStatus.ACTIVE,
      tags: createDto.tags || [],
      planDate: createDto.planDate
        ? dayjs(createDto.planDate).format("YYYY-MM-DD")
        : undefined,
    });

    await this.moduleRepository.save(resource);
    return this.findById(resource.id);
  }

  async findOneByRepeatAndDate(
    relatedId: string,
    date: Date
  ): Promise<ModuleDto | null> {
    const day = dayjs(date);
    const start = new Date(day.format("YYYY-MM-DD") + "T00:00:00");
    const end = new Date(day.format("YYYY-MM-DD") + "T23:59:59");
    const existed = await this.moduleRepository.findOne({
      where: {
        relatedId,
        planDate: Between(start, end),
      },
    });
    return existed ? ModuleDto.importEntity(existed) : null;
  }

  async createWithExtras(
    createDto: CreateModuleDto,
    extras: Partial<Module>
  ): Promise<ModuleDto> {
    const resource = this.moduleRepository.create({
      ...createDto,
      ...extras,
      status: ModuleStatus.ACTIVE,
      tags: createDto.tags || [],
      planDate: createDto.planDate
        ? dayjs(createDto.planDate).format("YYYY-MM-DD")
        : undefined,
    });
    await this.moduleRepository.save(resource);
    return this.findById(resource.id);
  }

  async findByFilter(filter: ModuleListFilterDto): Promise<ModuleDto[]> {
    const resourceList = await this.moduleRepository.find({
      where: this.buildWhere(filter),
    });
    return resourceList as ModuleDto[];
  }

  async page(filter: ModulePageFiltersDto): Promise<{
    list: ModuleDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [resourceList, total] = await this.moduleRepository.findAndCount({
      where: this.buildWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: resourceList as ModuleDto[],
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateDto: UpdateModuleDto): Promise<ModuleDto> {
    const resource = await this.moduleRepository.findOneBy({ id });
    if (!resource) {
      throw new Error("Module not found");
    }

    await this.moduleRepository.update(id, {
      ...updateDto,
      planDate: updateDto.planDate
        ? dayjs(updateDto.planDate).toDate()
        : undefined,
    });

    return this.findById(id);
  }

  async batchUpdate(
    includeIds: string[],
    updateDto: UpdateModuleDto
  ): Promise<ModuleDto[]> {
    if (!includeIds || includeIds.length === 0) return [];

    await this.moduleRepository.update(
      { id: In(includeIds) },
      {
        ...updateDto,
        planDate: updateDto.planDate
          ? dayjs(updateDto.planDate).toDate()
          : undefined,
      }
    );

    const updated = await this.moduleRepository.find({
      where: { id: In(includeIds) },
    });
    return (updated as unknown as ModuleDto[]) || [];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.moduleRepository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByFilter(filter: ModulePageFiltersDto): Promise<void> {
    await this.moduleRepository.delete(this.buildWhere(filter));
  }

  async findById(id: string, relations?: string[]): Promise<ModuleDto> {
    try {
      const resource = await this.moduleRepository.findOne({
        where: { id },
        relations: relations || [],
      });
      if (!resource) {
        throw new Error("Module not found");
      }

      // 手动加载related关系
      if (resource.relatedId) {
        const resourceWithRepeat = await this.moduleRepository.findOne({
          where: { id },
          relations: ["repeat"],
        });
        if (resourceWithRepeat?.repeat) {
          resource.repeat = resourceWithRepeat.repeat;
        }
      }

      return resource as ModuleDto;
    } catch (error) {
      console.error(error);
      throw new Error("Module not found");
    }
  }

  async updateRepeatId(id: string, relatedId: string): Promise<void> {
    await this.moduleRepository.update(id, { relatedId });
  }

  async softDeleteByRelatedIds(relatedIds: string[]): Promise<void> {
    if (!relatedIds || relatedIds.length === 0) return;
    await this.moduleRepository.softDelete({ relatedId: In(relatedIds) });
  }

  private buildWhere(
    filter: ModulePageFiltersDto | ModuleListFilterDto
  ): FindOptionsWhere<Module> {
    const where: FindOptionsWhere<Module> = {};

    if (filter.planDateStart && filter.planDateEnd) {
      where.planDate = Between(
        new Date(filter.planDateStart + "T00:00:00"),
        new Date(filter.planDateEnd + "T23:59:59")
      );
    } else if (filter.planDateStart) {
      where.planDate = MoreThan(new Date(filter.planDateStart + "T00:00:00"));
    } else if (filter.planDateEnd) {
      where.planDate = LessThan(new Date(filter.planDateEnd + "T23:59:59"));
    }

    if (filter.doneDateStart && filter.doneDateEnd) {
      where.doneAt = Between(
        new Date(filter.doneDateStart + "T00:00:00"),
        new Date(filter.doneDateEnd + "T23:59:59")
      );
    } else if (filter.doneDateStart) {
      where.doneAt = MoreThan(new Date(filter.doneDateStart + "T00:00:00"));
    } else if (filter.doneDateEnd) {
      where.doneAt = LessThan(new Date(filter.doneDateEnd + "T23:59:59"));
    }

    if (filter.abandonedDateStart && filter.abandonedDateEnd) {
      where.abandonedAt = Between(
        new Date(filter.abandonedDateStart + "T00:00:00"),
        new Date(filter.abandonedDateEnd + "T23:59:59")
      );
    } else if (filter.abandonedDateStart) {
      where.abandonedAt = MoreThan(
        new Date(filter.abandonedDateStart + "T00:00:00")
      );
    } else if (filter.abandonedDateEnd) {
      where.abandonedAt = LessThan(
        new Date(filter.abandonedDateEnd + "T23:59:59")
      );
    }

    if (filter.keyword) {
      where.name = Like(`%${filter.keyword}%`);
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.importance) {
      where.importance = filter.importance;
    }

    if (filter.urgency) {
      where.urgency = filter.urgency;
    }

    if (filter.relatedId) {
      where.relatedId = filter.relatedId;
    }

    if (filter.relatedIds) {
      where.relatedId = In(filter.relatedIds);
    }

    return where;
  }
}
```

## 📋 相关规范

- [Business Repository Interface 规范](./repository-business.mdc) - Interface 定义规范
- [Desktop Repository 规范](./repository-desktop.mdc) - Desktop 层实现规范
- [Entity 规范](../entity.mdc) - 数据实体定义规范
- [DTO 规范](../dto.mdc) - 数据传输对象规范
