---
trigger: model_decision
description: 编写server代码时
---

---
description: 编写server代码时
globs: 
alwaysApply: false
---
# Server 规范

## 📋 核心字段类型定义

```typescript
// 支持的字段类型
type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "Date"
  | "enum"
  | "object"
  | "array";

// 字段信息结构
interface FieldInfo {
  entityName: string; // 实体名称（支持嵌套路径，如 user/profile）
  fieldName: string; // 字段名称
  fieldType: FieldType; // 字段类型
  isNullable: boolean; // 是否可空
  description: string; // 字段描述
  enumValues?: string[]; // 枚举值（仅当类型为 enum 时）
}
```

## 🏗️ 项目结构约定

```
apps/server/src/business/{domain}/{module}/
├── entities/                          # 实体层
│   ├── {entity}.entity.ts            # TypeORM 实体文件
│   ├── {entity}.enum.ts              # 枚举定义
│   └── index.ts                      # 导出文件
├── dto/                              # 数据传输对象层
│   ├── {entity}-model.dto.ts         # 基础模型 DTO
│   ├── {entity}-form.dto.ts          # 表单操作 DTO
│   ├── {entity}-filter.dto.ts        # 过滤查询 DTO
│   └── index.ts                      # 导出文件
├── mappers/                          # 对象映射层
│   ├── {entity}.mapper.ts            # 对象映射文件
│   └── index.ts                      # 导出文件
├── {module}.controller.ts            # 控制器层
├── {module}.service.ts               # 业务服务层
├── {module}.repository.ts            # 数据访问层
└── {module}.module.ts                # 模块定义

packages/vo/{domain}/
└── {entity}-model.vo.ts              # 值对象接口文件
```

## 🔄 服务分层架构

### 分层职责定义

```
┌─────────────────────────────────────┐
│           控制器层                   │
│        {Module}Controller           │
│  ┌─────────────────────────────────┐ │
│  │ • 路由处理                      │ │
│  │ • 参数验证                      │ │
│  │ • VO ↔ DTO 转换                │ │
│  │ • 响应格式化                    │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           业务服务层                 │
│         {Module}Service             │
│  ┌─────────────────────────────────┐ │
│  │ • 业务逻辑编排                  │ │
│  │ • 事务管理                      │ │
│  │ • 跨模块调用                    │ │
│  │ • 复杂业务规则                  │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           数据访问层                 │
│       {Module}Repository            │
│  ┌─────────────────────────────────┐ │
│  │ • 基础 CRUD 操作                │ │
│  │ • 数据库查询                    │ │
│  │ • Entity ↔ DTO 转换            │ │
│  │ • 数据持久化                    │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           数据存储层                 │
│         TypeORM Entity              │
│  ┌─────────────────────────────────┐ │
│  │ • 数据模型定义                  │ │
│  │ • 关系映射                      │ │
│  │ • 数据验证                      │ │
│  │ • 数据库约束                    │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🎯 控制器层 ({module}.controller.ts)

### 标准控制器模板
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { {Module}Service } from "./{module}.service";
import { {Module}Mapper } from "./mappers/{module}.mapper";
import type { {Module} as {Module}VO } from "@life-toolkit/vo";
import { Create{Module}Dto, Update{Module}Dto, {Module}PageFilterDto } from "./dto";

@Controller("{module}")
export class {Module}Controller {
  constructor(private readonly {module}Service: {Module}Service) {}

  /**
   * 创建{实体}
   */
  @Post()
  async create(@Body() createVo: {Module}VO.Create{Module}Vo): Promise<{Module}VO.{Module}ItemVo> {
    const createDto = {Module}Mapper.voToCreateDto(createVo);
    const dto = await this.{module}Service.create(createDto);
    return {Module}Mapper.dtoToItemVo(dto);
  }

  /**
   * 分页查询{实体}列表
   */
  @Get()
  async page(@Query() filterVo: {Module}VO.{Module}PageFiltersVo): Promise<{Module}VO.{Module}PageVo> {
    const filterDto = {Module}Mapper.voToPageFilterDto(filterVo);
    const { list, total } = await this.{module}Service.page(filterDto);
    return {Module}Mapper.dtoToPageVo(list, total, filterDto.pageNum || 1, filterDto.pageSize || 10);
  }

  /**
   * 根据ID查询{实体}
   */
  @Get(":id")
  async findById(@Param("id") id: string): Promise<{Module}VO.{Module}Vo> {
    const dto = await this.{module}Service.findById(id);
    return {Module}Mapper.dtoToVo(dto);
  }

  /**
   * 更新{实体}
   */
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateVo: {Module}VO.Update{Module}Vo
  ): Promise<{Module}VO.{Module}ItemVo> {
    const updateDto = {Module}Mapper.voToUpdateDto(updateVo);
    const dto = await this.{module}Service.update(id, updateDto);
    return {Module}Mapper.dtoToItemVo(dto);
  }

  /**
   * 删除{实体}
   */
  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    await this.{module}Service.delete(id);
  }

  /**
   * 批量操作 - 完成
   */
  @Post("batch/done")
  async batchDone(@Body() params: {Module}VO.OperationByIdListVo): Promise<void> {
    await this.{module}Service.batchDone(params);
  }

  /**
   * 状态操作 - 完成
   */
  @Post(":id/done")
  async done(@Param("id") id: string): Promise<boolean> {
    return await this.{module}Service.done(id);
  }

  /**
   * 状态操作 - 放弃
   */
  @Post(":id/abandon")
  async abandon(@Param("id") id: string): Promise<boolean> {
    return await this.{module}Service.abandon(id);
  }

  /**
   * 状态操作 - 恢复
   */
  @Post(":id/restore")
  async restore(@Param("id") id: string): Promise<boolean> {
    return await this.{module}Service.restore(id);
  }
}
```

## 🔧 数据访问层 ({module}.repository.ts)

### 标准Repository模板
```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { {Entity} } from "./entities";
import { {Module}Mapper } from "./mappers/{module}.mapper";
import { Create{Module}Dto, Update{Module}Dto, {Module}Dto, {Module}PageFilterDto, {Module}ListFilterDto } from "./dto";

@Injectable()
export class {Module}Repository {
  constructor(
    @InjectRepository({Entity})
    private readonly {entity}Repository: Repository<{Entity}>,
  ) {}

  /**
   * 创建{实体}
   */
  async create(create{Entity}Dto: Create{Entity}Dto): Promise<{Entity}Dto> {
    const entity = this.{entity}Repository.create(create{Entity}Dto);
    const savedEntity = await this.{entity}Repository.save(entity);
    return {Entity}Mapper.entityToDto(savedEntity);
  }

  /**
   * 根据ID查询{实体}
   */
  async findById(id: string, relations?: string[]): Promise<{Entity}Dto> {
    const entity = await this.{entity}Repository.findOne({
      where: { id },
      relations,
    });
    if (!entity) {
      throw new NotFoundException(`{Entity}不存在，ID: ${id}`);
    }
    return {Entity}Mapper.entityToDto(entity);
  }

  /**
   * 查询{实体}列表
   */
  async findAll(filter: {Entity}ListFilterDto): Promise<{Entity}Dto[]> {
    const query = this.buildQuery(filter);
    const entities = await query.getMany();
    return entities.map(entity => {Entity}Mapper.entityToDto(entity));
  }

  /**
   * 分页查询{实体}
   */
  async page(
    filter: {Entity}PageFilterDto
  ): Promise<{ list: {Entity}Dto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const skip = (pageNum - 1) * pageSize;

    const query = this.buildQuery(filter);
    const [entities, total] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: entities.map(entity => {Entity}Mapper.entityToDto(entity)),
      total,
    };
  }

  /**
   * 更新{实体}
   */
  async update(id: string, update{Entity}Dto: Update{Entity}Dto): Promise<{Entity}Dto> {
    const entity = await this.{entity}Repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`{Entity}不存在，ID: ${id}`);
    }

    Object.assign(entity, update{Entity}Dto);
    const savedEntity = await this.{entity}Repository.save(entity);
    return {Entity}Mapper.entityToDto(savedEntity);
  }

  /**
   * 删除{实体}
   */
  async delete(id: string): Promise<void> {
    const entity = await this.{entity}Repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`{Entity}不存在，ID: ${id}`);
    }
    await this.{entity}Repository.remove(entity);
  }

  /**
   * 软删除{实体}
   */
  async softDelete(id: string): Promise<void> {
    const result = await this.{entity}Repository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`{Entity}不存在，ID: ${id}`);
    }
  }

  /**
   * 批量更新
   */
  async batchUpdate(ids: string[], updateData: Partial<{Entity}>): Promise<void> {
    await this.{entity}Repository.update(
      { id: In(ids) },
      updateData
    );
  }

  /**
   * 构建查询条件
   */
  private buildQuery(filter: {Entity}ListFilterDto) {
    let query = this.{entity}Repository.createQueryBuilder("{entity}");

    // 状态过滤
    if (filter.status && filter.status.length > 0) {
      query = query.andWhere("{entity}.status IN (:...status)", { status: filter.status });
    }

    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere(
        "({entity}.name LIKE :keyword OR {entity}.description LIKE :keyword)",
        { keyword: `%${filter.keyword}%` }
      );
    }

    // 日期范围过滤
    if (filter.dateStart) {
      query = query.andWhere("{entity}.createdAt >= :dateStart", { dateStart: filter.dateStart });
    }
    if (filter.dateEnd) {
      query = query.andWhere("{entity}.createdAt <= :dateEnd", { dateEnd: filter.dateEnd });
    }

    // 用户过滤
    if (filter.userId) {
      query = query.andWhere("{entity}.userId = :userId", { userId: filter.userId });
    }

    // 排除自身
    if (filter.withoutSelf) {
      query = query.andWhere("{entity}.id != :selfId", { selfId: filter.withoutSelf });
    }

    return query.orderBy("{entity}.updatedAt", "DESC");
  }
}
```

## 🎯 业务服务层 ({module}.service.ts)

### 标准Service模板
```typescript
import { Injectable, BadRequestException } from "@nestjs/common";
import { {Module}Repository } from "./{module}.repository";
import { Create{Module}Dto, Update{Module}Dto, {Module}Dto, {Module}PageFilterDto, {Module}ListFilterDto } from "./dto";
import { {Module}Status } from "./entities";
import type { {Module} as {Module}VO } from "@life-toolkit/vo";

@Injectable()
export class {Module}Service {
  constructor(
    private readonly {module}Repository: {Module}Repository,
  ) {}

  /**
   * 创建{实体}
   */
  async create(create{Module}Dto: Create{Module}Dto): Promise<{Module}Dto> {
    // 业务验证
    await this.validateBusinessRules(create{Module}Dto);

    // 数据处理
    const processedDto = await this.processCreateData(create{Module}Dto);

    // 调用数据访问层
    const result = await this.{module}Repository.create(processedDto);

    return result;
  }

  /**
   * 查询{实体}列表
   */
  async findAll(filter: {Module}ListFilterDto): Promise<{Module}Dto[]> {
    // 权限检查
    await this.checkPermission(filter);

    return await this.{module}Repository.findAll(filter);
  }

  /**
   * 分页查询{实体}
   */
  async page(filter: {Module}PageFilterDto): Promise<{ list: {Module}Dto[]; total: number }> {
    // 权限检查
    await this.checkPermission(filter);

    return await this.{module}Repository.page(filter);
  }

  /**
   * 根据ID查询{实体}
   */
  async findById(id: string): Promise<{Module}Dto> {
    return await this.{module}Repository.findById(id);
  }

  /**
   * 更新{实体}
   */
  async update(id: string, update{Module}Dto: Update{Module}Dto): Promise<{Module}Dto> {
    // 业务验证
    await this.validateUpdateRules(id, update{Module}Dto);

    // 数据处理
    const processedDto = await this.processUpdateData(update{Module}Dto);

    // 调用数据访问层
    const result = await this.{module}Repository.update(id, processedDto);

    // 后置处理
    await this.afterUpdate(result);

    return result;
  }

  /**
   * 删除{实体}
   */
  async delete(id: string): Promise<void> {
    // 删除前检查
    await this.validat