
# True North 完整开发流程规范

## 📋 概述

本规范定义了 True North 项目从数据格式定义到控制器实现的完整开发流程，确保各层级代码规范统一、接口一致、流程连贯。

## 🏗️ 系统架构总览

### 分层架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                    客户端层 (Client Layer)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           apps/desktop/src/render (React)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                    路由层 (Route Layer)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     RouteController + IPC（Electron 主进程 service）      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                  业务层 (Business Layer)                      │
│  ┌─────────────────┬─────────────────┬─────────────────┐   │
│  │   Controller    │    Service      │   Repository     │   │
│  │   (业务逻辑)    │   (业务规则)    │   (数据访问)     │   │
│  └─────────────────┴─────────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                   数据层 (Data Layer)                         │
│  ┌─────────────────┬─────────────────────────────────────┐   │
│  │     Entity      │           VO/DTO                    │   │
│  │   (数据模型)    │   (数据传输 + 内置映射方法)         │   │
│  └─────────────────┴─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 开发流程总览

```
1. 数据格式定义 → 2. 业务逻辑 → 3. 控制器 → 4. 字段控制
    ↓                ↓            ↓            ↓
  Entity规范      Repository    Controller   Field Manage
  DTO/VO规范      Service规范   Service规范  Filter规范
```

## 🔄 完整开发流程

### 第一阶段：数据格式定义

#### 1.1 Entity 定义（数据模型）
**位置**: `apps/desktop/src/service/growth/{module}/`（entity、dto、service、repository、route-controller）

**核心原则**:
- 继承 `BaseEntity` 获取基础字段
- 使用 TypeORM 装饰器定义字段类型和约束
- 明确关联关系和级联操作

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{domain}/{module}/{module}.entity.ts
import { BaseEntity } from "../../base/base.entity";
import { EntityStatus, EntityType } from "@true-north/enum";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { IsString, IsOptional, IsEnum, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class ModuleModel extends BaseEntity {
  /** 名称 */
  @Column("varchar")
  @IsString()
  name!: string;

  /** 描述 */
  @Column("text", { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 状态 */
  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
  })
  @IsEnum(EntityStatus)
  status!: EntityStatus;

  /** 优先级 */
  @Column("int", { nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priority?: number;

  /** 处理时间 */
  @Column("datetime", { nullable: true })
  processedAt?: Date;
}

@Entity("module")
export class Module extends ModuleModel {
  /** 关联上级 */
  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent?: Module;

  @Column("varchar", { nullable: true })
  parentId?: string;
}
```

#### 1.2 DTO 定义（数据传输对象）
**位置**: `apps/desktop/src/service/growth/{domain}/{module}/dto/`

**核心原则**:
- 区分创建、更新、查询等不同场景的 DTO
- 使用 class-validator 进行数据验证
- 使用 class-transformer 进行数据转换

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{domain}/{module}/dto/create-{module}.dto.ts
import { IsString, IsOptional, IsEnum, IsNumber, IsISO8601 } from "class-validator";
import { Type } from "class-transformer";
import { EntityStatus } from "@true-north/enum";

export class CreateModuleDto {
  /** 名称 */
  @IsString()
  name!: string;

  /** 描述 */
  @IsString()
  @IsOptional()
  description?: string;

  /** 状态 */
  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;

  /** 优先级 */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priority?: number;

  /** 计划日期 */
  @IsISO8601()
  @IsOptional()
  planDate?: string;
}
```

#### 1.3 VO 定义（值对象）
**位置**: `packages/business/vo/{domain}/{module}/`

**核心原则**:
- 定义前端展示和接口传输的数据格式
- 保持与后端 DTO 的映射关系
- 确保类型安全和数据一致性

**示例代码**:
```typescript
// packages/business/vo/{domain}/{module}/{module}.vo.ts
export namespace ModuleVO {
  export interface ModuleItemVo {
    id: string;
    name: string;
    description?: string;
    status: EntityStatus;
    priority?: number;
    planDate?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreateModuleVo {
    name: string;
    description?: string;
    priority?: number;
    planDate?: string;
  }

  export interface UpdateModuleVo {
    name?: string;
    description?: string;
    status?: EntityStatus;
    priority?: number;
    planDate?: string;
  }
}
```

### 第二阶段：业务逻辑实现

#### 2.1 Repository 定义（数据访问层）
**位置**: `apps/desktop/src/service/growth/{domain}/{module}/*.repository.ts`

**核心原则**:
- 实现数据访问接口
- 使用 DTO 内置方法进行 Entity ↔ DTO 转换
- 处理复杂查询和关联关系

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{domain}/{module}/{module}.repository.ts
import { Module } from "./entities/{module}.entity";
import { ModuleDto, CreateModuleDto, UpdateModuleDto } from "./dto";

export abstract class ModuleRepository {
  async create(createDto: CreateModuleDto): Promise<ModuleDto> {
    const entity = this.repo.create(createDto);
    const saved = await this.repo.save(entity);
    return ModuleDto.importEntity(saved);
  }

  async findWithRelations(id: string): Promise<ModuleDto | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ModuleDto.importEntity(entity) : null;
  }

  static createDtoToEntity(createDto: CreateModuleDto): Partial<Module> {
    return {
      name: createDto.name,
      description: createDto.description,
      status: createDto.status || EntityStatus.ACTIVE,
      priority: createDto.priority,
      planDate: createDto.planDate ? new Date(createDto.planDate) : undefined,
    };
  }
}
```

### 第三阶段：业务逻辑

#### 3.1 Repository Interface 定义（数据访问契约）
**位置**: `apps/desktop/src/service/growth/{domain}/{module}/*.repository.ts`

**核心原则**:
- 定义数据访问的统一接口
- 支持跨平台实现
- 明确方法签名和返回类型

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{domain}/{module}/{module}.repository.ts
import { Module } from "./{module}.entity";
import { CreateModuleDto, UpdateModuleDto, ModulePageFilterDto, ModuleListFilterDto, ModuleDto } from "./dto";

export interface ModuleRepository {
  // 创建操作
  create(createModuleDto: CreateModuleDto): Promise<ModuleDto>;
  createWithExtras(createModuleDto: CreateModuleDto, extras: Partial<Module>): Promise<ModuleDto>;

  // 查询操作
  findByFilter(filter: ModuleListFilterDto): Promise<ModuleDto[]>;
  page(filter: ModulePageFilterDto): Promise<{
    list: ModuleDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  findWithRelations(id: string, relations?: string[]): Promise<ModuleDto>;

  // 更新操作
  update(id: string, updateModuleDto: UpdateModuleDto): Promise<ModuleDto>;
  batchUpdate(includeIds: string[], updateModuleDto: UpdateModuleDto): Promise<ModuleDto[]>;

  // 删除操作
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: ModulePageFilterDto): Promise<void>;
  softDeleteByParentIds(parentIds: string[]): Promise<void>;

  // 特殊业务操作
  updateParentId(id: string, parentId: string): Promise<void>;
}
```

#### 3.2 Repository 实现（SQLite / TypeORM）
**位置**: `apps/desktop/src/service/growth/{domain}/{module}/*.repository.ts`

**核心原则**:
- 使用 TypeORM 实现复杂查询
- 支持事务管理和关联查询
- 优化数据库性能

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{domain}/{module}/{module}.repository.ts
@Injectable()
export class ModuleRepository {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<ModuleDto> {
    const module = this.moduleRepository.create({
      ...createModuleDto,
      status: EntityStatus.ACTIVE,
      planDate: createModuleDto.planDate ? dayjs(createModuleDto.planDate).format("YYYY-MM-DD") : undefined,
    });

    await this.moduleRepository.save(module);
    return this.findWithRelations(module.id);
  }

  async page(filter: ModulePageFilterDto): Promise<{
    list: ModuleDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [moduleList, total] = await this.moduleRepository.findAndCount({
      where: this.buildWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: moduleList as ModuleDto[],
      total,
      pageNum,
      pageSize,
    };
  }

  private buildWhere(filter: ModulePageFilterDto): FindOptionsWhere<Module> {
    const where: FindOptionsWhere<Module> = {};

    // 日期范围条件
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

    return where;
  }
}
```

#### 3.3 Repository Desktop 实现（SQLite）
**位置**: `apps/desktop/src/database/{domain}/{module}/*.repository.ts`

**核心原则**:
- 适配 SQLite 轻量级查询
- 优化本地数据访问性能
- 支持离线数据操作

**示例代码**:
```typescript
// apps/desktop/src/database/{domain}/{module}/{module}.repository.ts
export class ModuleRepository {
  private repo: Repository<Module> = AppDataSource.getRepository(Module);

  private buildQuery(filter: ModuleListFilterDto) {
    const qb = this.repo
      .createQueryBuilder("module")
      .leftJoinAndSelect("module.parent", "parent");

    if (filter.status !== undefined) {
      qb.andWhere("module.status = :status", { status: filter.status });
    }
    if (filter.keyword) {
      qb.andWhere("module.name LIKE :kw", { kw: `%${filter.keyword}%` });
    }

    return qb;
  }

  async create(createDto: CreateModuleDto): Promise<ModuleDto> {
    const entity = this.repo.create({
      name: createDto.name,
      description: createDto.description,
      status: createDto.status ?? EntityStatus.ACTIVE,
      priority: createDto.priority,
      planDate: createDto.planDate,
    });

    const saved = await this.repo.save(entity);
    return ModuleDto.importEntity(saved);
  }

  async page(filter: ModulePageFilterDto): Promise<{
    list: ModuleDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);

    const [list, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .orderBy("module.createdAt", "DESC")
      .getManyAndCount();

    return {
      list: list.map((item) => ModuleDto.importEntity(item)),
      total,
      pageNum,
      pageSize,
    };
  }
}
```

#### 3.4 Service 定义（业务服务）
**位置**: `apps/desktop/src/service/growth/{domain}/{module}/*.service.ts`

**核心原则**:
- 实现业务规则和逻辑处理
- 协调多个 Repository 的操作
- 处理事务和异常

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{domain}/{module}/{module}.service.ts
export class ModuleService {
  protected moduleRepository: ModuleRepository;

  constructor(moduleRepository: ModuleRepository) {
    this.moduleRepository = moduleRepository;
  }

  async create(createDto: CreateModuleDto): Promise<ModuleDto> {
    // 业务规则验证
    if (!createDto.name?.trim()) {
      throw new Error("模块名称不能为空");
    }

    // 创建模块
    const module = await this.moduleRepository.create(createDto);

    // 触发相关业务逻辑
    // ...

    return module;
  }

  async process(id: string): Promise<ModuleDto> {
    // 查找模块
    const module = await this.moduleRepository.findWithRelations(id);

    // 业务规则：只有激活状态的模块才能处理
    if (module.status !== EntityStatus.ACTIVE) {
      throw new Error("只有激活状态的模块才能处理");
    }

    // 更新状态
    const updateDto = new UpdateModuleDto();
    updateDto.status = EntityStatus.PROCESSED;
    updateDto.processedAt = new Date();

    return await this.moduleRepository.update(id, updateDto);
  }

  async page(filter: ModulePageFilterDto): Promise<{
    list: ModuleDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    // 业务规则处理
    if (filter.pageSize > 100) {
      filter.pageSize = 100; // 限制最大分页大小
    }

    return await this.moduleRepository.page(filter);
  }
}
```

### 第四阶段：RouteController（IPC + VO 边界）

**位置**: `apps/desktop/src/service/growth/{module}/{module}.route-controller.ts`

**核心原则**:
- 唯一 Controller：同时承担 REST 路径声明与 VO ↔ DTO
- 装饰器使用 `@business/decorators`（桥接 `electron-ipc-restful`）
- 业务规则仍在 Service；不另建 `*.controller.ts` 透传层
- 在 `src/main/ipc-handlers.ts` 注册 Class（构造器默认注入 service 单例）

详细规范见 [controller-desktop.md](./controller/controller-desktop.md)。

**示例代码**:
```typescript
// apps/desktop/src/service/growth/{module}/{module}.route-controller.ts
import { Controller, Post, Get, Body, Query } from '@business/decorators';
import { ModuleService, moduleService as defaultModuleService } from './{module}.service';

@Controller('/{module}')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService = defaultModuleService) {}

  @Post('/create', { description: '创建' })
  async create(@Body() createVo: ModuleVO.CreateModuleVo): Promise<ModuleVO.ModuleItemVo> {
    const createDto = CreateModuleDto.importVo(createVo);
    const dto = await this.moduleService.create(createDto);
    return dto.exportVo();
  }

  @Get('/list', { description: '列表' })
  async list(@Query() filter: ModuleVO.ModuleListFilterVo): Promise<ModuleVO.ModuleItemVo[]> {
    const filterDto = ModuleListFilterDto.importVo(filter);
    const dtos = await this.moduleService.findByFilter(filterDto);
    return dtos.map((dto) => dto.exportVo());
  }
}
```

### 第五阶段：字段控制

#### 5.1 字段流转管理
**参考**: [`field-manage.md`](./field-manage.md)

**核心原则**:
- 确保字段在各层级的定义一致性
- 提供完整的字段变更实施路径
- 验证字段流转的完整性

#### 5.2 筛选功能管理
**参考**: [`field-filter-manage.md`](./field-filter-manage.md)

**核心原则**:
- 支持灵活的筛选操作符
- 优化数据库查询性能
- 确保筛选功能的安全性

## 🔄 完整流程验证

### 开发流程检查清单

#### 1. 数据格式定义验证
- [ ] Entity 字段定义完整且规范
- [ ] DTO 验证规则正确配置
- [ ] VO 与后端数据结构对应
- [ ] 枚举值在各层级保持一致

#### 2. 数据转换验证
- [ ] DTO 内置方法实现 Entity ↔ DTO 双向转换
- [ ] 日期格式正确处理
- [ ] 枚举值正确映射
- [ ] 关联关系正确处理

#### 3. 业务逻辑验证
- [ ] Repository Interface 定义完整
- [ ] Server Repository 实现 TypeORM 规范
- [ ] Desktop Repository 适配 SQLite 优化
- [ ] Service 实现业务规则正确

#### 4. 控制器验证
- [ ] RouteController 处理 VO ↔ DTO 转换
- [ ] RouteController 路径已注册到 `initIpcRouter` / electron-ipc-restful
- [ ] `@true-north/web-service/controller` 路径与 RouteController 对齐
- [ ] 异常处理机制完善

#### 5. 字段控制验证
- [ ] 字段在各层级定义一致
- [ ] 筛选功能操作符支持完整
- [ ] 数据库索引优化到位
- [ ] 性能和安全验证通过

## 📊 架构优势

### 1. 分层清晰
- **数据层**: Entity/DTO/VO 专注于数据定义和转换
- **业务层**: Repository/Service 专注于业务逻辑实现
- **控制层**: Controller 专注于接口适配和请求处理

### 2. 跨平台支持
- **Business Layer**: 核心业务逻辑平台无关
- **Adapter Layer**: Server/Desktop 分别适配不同平台
- **统一接口**: 通过 VO 保持前后端接口一致性

### 3. 开发效率
- **代码复用**: 核心逻辑可以被多个平台共享
- **并行开发**: 各层级可以独立开发和测试
- **维护便利**: 问题定位和修复更加精准

### 4. 可扩展性
- **新平台支持**: 只需开发对应的 Adapter 层
- **功能扩展**: 在对应层级添加新功能影响最小
- **版本演进**: 各层级可以独立演进和部署

## 📚 相关规范文档

- **[`entity.md`](./entity.md)** - Entity 规范（数据模型定义）
- **[`dto.md`](./dto.md)** - DTO 规范（数据传输对象）
- **[`vo.md`](./vo.md)** - VO 规范（值对象）
- **[`repository.md`](./repository.md)** - Repository 规范总览
- **[`service.md`](./service.md)** - Service 规范（业务服务）
- **[`controller.md`](./controller.md)** - Controller 规范总览
- **[`field-manage.md`](./field-manage.md)** - 字段流转管理
- **[`field-filter-manage.md`](./field-filter-manage.md)** - 筛选功能管理

## 🎯 最佳实践

### 1. 开发顺序
1. **数据格式定义** - Entity/DTO/VO
2. **业务逻辑实现** - Repository/Service
3. **控制器开发** - Business/Server/Desktop Controller
4. **字段控制** - 字段管理和筛选功能

### 2. 代码规范
- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier 统一代码风格
- 编写完整的单元测试和集成测试

### 3. 文档维护
- 及时更新 API 文档
- 保持代码注释的准确性和完整性
- 记录重要的设计决策和权衡考虑

### 4. 质量保证
- 实施 Code Review 流程
- 自动化测试覆盖核心功能
- 性能监控和错误追踪

---

*此文档为 True North 完整开发流程规范总览，确保从数据定义到控制器实现的各个环节规范统一、流程连贯。* 

