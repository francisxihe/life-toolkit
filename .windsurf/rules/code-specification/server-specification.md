---
trigger: model_decision
description: 编写server代码时
globs: 
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
    // 调用数据访问层
    const result = await this.{module}Repository.create(create{Module}Dto);

    return result;
  }

  /**
   * 查询{实体}列表
   */
  async findAll(filter: {Module}ListFilterDto): Promise<{Module}Dto[]> {
    return await this.{module}Repository.findAll(filter);
  }

  /**
   * 分页查询{实体}
   */
  async page(filter: {Module}PageFilterDto): Promise<{ list: {Module}Dto[]; total: number }> {
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
    // 调用数据访问层
    const result = await this.{module}Repository.update(id, update{Module}Dto);

    return result;
  }

  /**
   * 删除{实体}
   */
  async delete(id: string): Promise<void> {
    await this.{module}Repository.delete(id);
  }

  /**
   * 状态操作 - 完成
   */
  async done(id: string): Promise<boolean> {
    const entity = await this.{module}Repository.findById(id);

    // 业务规则验证
    if (!this.canMarkAsDone(entity)) {
      throw new BadRequestException("当前状态不允许标记为完成");
    }

    await this.{module}Repository.update(id, {
      status: {Module}Status.COMPLETED,
      completedAt: new Date(),
    });

    return true;
  }

  /**
   * 状态操作 - 放弃
   */
  async abandon(id: string): Promise<boolean> {
    const entity = await this.{module}Repository.findById(id);

    // 业务规则验证
    if (!this.canAbandon(entity)) {
      throw new BadRequestException("当前状态不允许放弃");
    }

    await this.{module}Repository.update(id, {
      status: {Module}Status.CANCELLED,
      cancelledAt: new Date(),
    });

    return true;
  }

  /**
   * 状态操作 - 恢复
   */
  async restore(id: string): Promise<boolean> {
    const entity = await this.{module}Repository.findById(id);

    // 业务规则验证
    if (!this.canRestore(entity)) {
      throw new BadRequestException("当前状态不允许恢复");
    }

    await this.{module}Repository.update(id, {
      status: {Module}Status.ACTIVE,
      restoredAt: new Date(),
    });

    return true;
  }

  /**
   * 批量操作 - 完成
   */
  async batchDone(params: {Module}VO.OperationByIdListVo): Promise<void> {
    await this.{module}Repository.batchUpdate(params.idList, {
      status: {Module}Status.COMPLETED,
      completedAt: new Date(),
    });
  }

  // ==================== 私有业务方法 ====================


  /**
   * 业务规则判断 - 是否可以标记为完成
   */
  private canMarkAsDone(entity: {Module}Dto): boolean {
    return entity.status === {Module}Status.ACTIVE;
  }

  /**
   * 业务规则判断 - 是否可以放弃
   */
  private canAbandon(entity: {Module}Dto): boolean {
    return entity.status === {Module}Status.ACTIVE;
  }

  /**
   * 业务规则判断 - 是否可以恢复
   */
  private canRestore(entity: {Module}Dto): boolean {
    return entity.status === {Module}Status.CANCELLED;
  }
}
```

## 🔧 模块定义 ({module}.module.ts)

### 标准Module模板
```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { {Entity} } from "./entities";
import { {Module}Controller } from "./{module}.controller";
import { {Module}Service } from "./{module}.service";
import { {Module}Repository } from "./{module}.repository";

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}])],
  controllers: [{Module}Controller],
  providers: [{Module}Service, {Module}Repository],
  exports: [{Module}Service, {Module}Repository],
})
export class {Module}Module {}
```

## 🎯 字段类型映射

### TypeORM 装饰器映射
```typescript
const TYPE_DECORATORS: Record<FieldType, string> = {
  string: "@Column('varchar')",
  number: "@Column('int')",
  boolean: "@Column('boolean')",
  Date: '@Column("datetime")',
  enum: '@Column({ type: "enum", enum: {EnumType} })',
  object: '@Column("json")',
  array: '@Column("simple-array")',
};

const VALIDATOR_DECORATORS: Record<FieldType, string> = {
  string: "@IsString()",
  number: "@IsNumber() @Type(() => Number)",
  boolean: "@IsBoolean() @Type(() => Boolean)",
  Date: "@IsISO8601() @Type(() => Date)",
  enum: "@IsEnum({EnumType})",
  object: "@IsObject()",
  array: "@IsArray() @IsString({ each: true })",
};
```

### 字段生成模板
```typescript
// Entity 字段模板
/** {description} */
{typeDecorator}
{nullableDecorator}  // @IsOptional() 如果 isNullable 为 true
{validatorDecorator}
{fieldName}{nullableSymbol}: {fieldType};

// 示例：
/** 用户状态 */
@Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
@IsEnum(UserStatus)
status: UserStatus = UserStatus.ACTIVE;
```

## 🚫 禁止事项

1. **不要在Controller中包含业务逻辑** - 业务逻辑应在Service层
2. **不要在Repository中包含复杂业务规则** - Repository仅负责数据访问
3. **不要跳过Service层直接调用Repository** - 保持分层清晰
4. **不要在Entity中包含业务方法** - Entity仅用于数据模型定义
5. **不要忽略错误处理** - 每层都应有适当的错误处理
6. **不要在Mapper中包含业务逻辑** - Mapper仅负责数据转换
7. **不要混合不同层级的职责** - 保持单一职责原则

## ✅ 检查清单

在创建或修改服务端代码时，请确认以下事项：

### 项目结构
- [ ] 目录结构符合规范
- [ ] 文件命名符合约定
- [ ] 导出文件完整
- [ ] 模块边界清晰

### 分层架构
- [ ] Controller只处理HTTP请求响应
- [ ] Service包含业务逻辑
- [ ] Repository只负责数据访问
- [ ] Entity只定义数据模型
- [ ] Mapper只负责数据转换

### 代码质量
- [ ] 错误处理完善
- [ ] 类型定义明确
- [ ] 验证规则完整
- [ ] 注释清晰准确
- [ ] 遵循命名约定

### 业务逻辑
- [ ] 业务规则验证完整
- [ ] 权限检查到位
- [ ] 事务处理正确
- [ ] 状态管理合理

### 性能考虑
- [ ] 查询优化合理
- [ ] 分页处理正确
- [ ] 关联数据加载优化
- [ ] 缓存策略合理

## 📝 完整示例

```typescript
// goal.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { GoalService } from "./goal.service";
import { GoalMapper } from "./mappers/goal.mapper";
import type { Goal as GoalVO } from "@life-toolkit/vo";

@Controller("goal")
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async create(@Body() createVo: GoalVO.CreateGoalVo): Promise<GoalVO.GoalItemVo> {
    const createDto = GoalMapper.voToCreateDto(createVo);
    const dto = await this.goalService.create(createDto);
    return GoalMapper.dtoToItemVo(dto);
  }

  @Get()
  async page(@Query() filterVo: GoalVO.GoalPageFiltersVo): Promise<GoalVO.GoalPageVo> {
    const filterDto = GoalMapper.voToPageFilterDto(filterVo);
    const { list, total } = await this.goalService.page(filterDto);
    return GoalMapper.dtoToPageVo(list, total, filterDto.pageNum || 1, filterDto.pageSize || 10);
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<GoalVO.GoalVo> {
    const dto = await this.goalService.findById(id);
    return GoalMapper.dtoToVo(dto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateVo: GoalVO.UpdateGoalVo
  ): Promise<GoalVO.GoalItemVo> {
    const updateDto = GoalMapper.voToUpdateDto(updateVo);
    const dto = await this.goalService.update(id, updateDto);
    return GoalMapper.dtoToItemVo(dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    await this.goalService.delete(id);
  }

  @Post(":id/done")
  async done(@Param("id") id: string): Promise<boolean> {
    return await this.goalService.done(id);
  }
}

// goal.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Goal } from "./entities";
import { GoalController } from "./goal.controller";
import { GoalService } from "./goal.service";
import { GoalRepository } from "./goal.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Goal])],
  controllers: [GoalController],
  providers: [GoalService, GoalRepository],
  exports: [GoalService, GoalRepository],
})
export class GoalModule {}
```
