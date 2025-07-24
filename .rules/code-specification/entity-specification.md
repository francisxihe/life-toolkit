# Entity 规范

## 📋 概述

本规范定义了 Life Toolkit 项目中 TypeORM Entity 的标准结构、装饰器使用、验证约束等规范，确保数据模型的一致性、类型安全和数据完整性。

## 🏗️ 基础架构

### 继承结构

```typescript
// 所有业务 Entity 必须继承 BaseEntity
import { BaseEntity } from "@/base/base.entity";

@Entity("table_name")
export class BusinessEntity extends BaseEntity {
  // 业务字段定义
}
```

### BaseEntity 提供的基础字段

```typescript
export class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string; // 主键 (UUID)

  @CreateDateColumn()
  createdAt: Date; // 创建时间

  @UpdateDateColumn()
  updatedAt: Date; // 更新时间

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // 软删除时间
}
```

## 🎯 Entity 定义规范

### 1. 文件命名约定

- **Entity 文件**: `{module}.entity.ts`
- **枚举文件**: `{module}.enum.ts` 或在 entity 文件中定义
- **索引文件**: `index.ts`

### 2. 导入顺序

```typescript
// 1. TypeORM 装饰器
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  OneToOne,
  JoinColumn,
  JoinTable,
  Index,
  Tree,
  TreeParent,
  TreeChildren,
} from "typeorm";

// 2. 验证装饰器
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsInt,
  IsEmail,
  IsUrl,
  Min,
  Max,
  Length,
  IsISO8601,
} from "class-validator";

// 3. 转换装饰器
import { Type } from "class-transformer";

// 4. 基础类和枚举
import { BaseEntity } from "@/base/base.entity";

// 5. 本模块枚举
import { ModuleStatus, ModuleType } from "./module.enum";

// 6. 关联实体
import { RelatedEntity } from "../related/entities";
```

### 3. Entity 装饰器规范

```typescript
// 标准格式：表名使用下划线命名
@Entity("module_name")
export class ModuleName extends BaseEntity {
  // 字段定义
}

// 树形结构实体
@Entity("tree_module")
@Tree("closure-table")
export class TreeModule extends BaseEntity {
  // 字段定义
}

// 复合索引定义
@Entity("indexed_module")
@Index(["field1", "field2"], { unique: true })
export class IndexedModule extends BaseEntity {
  // 字段定义
}
```

## 📝 字段定义规范

### 1. 字段定义模板

```typescript
/** 字段描述 */
@Column(columnOptions)
@ValidationDecorator()
@TransformDecorator()
fieldName: FieldType;
```

### 2. 字段类型映射表

```typescript
const FIELD_TYPE_MAPPING = {
  // 基础类型
  string: {
    column: "@Column()",
    validator: "@IsString()",
    transform: null,
    tsType: "string",
  },
  text: {
    column: "@Column('text')",
    validator: "@IsString()",
    transform: null,
    tsType: "string",
  },
  number: {
    column: "@Column('int')",
    validator: "@IsNumber()",
    transform: "@Type(() => Number)",
    tsType: "number",
  },
  decimal: {
    column: "@Column('decimal', { precision: 10, scale: 2 })",
    validator: "@IsNumber()",
    transform: "@Type(() => Number)",
    tsType: "number",
  },
  boolean: {
    column: "@Column('boolean')",
    validator: "@IsBoolean()",
    transform: "@Type(() => Boolean)",
    tsType: "boolean",
  },
  date: {
    column: "@Column('date')",
    validator: "@IsISO8601()",
    transform: "@Type(() => Date)",
    tsType: "Date",
  },
  datetime: {
    column: "@Column('datetime')",
    validator: "@IsISO8601()",
    transform: "@Type(() => Date)",
    tsType: "Date",
  },
  enum: {
    column: "@Column({ type: 'enum', enum: EnumType })",
    validator: "@IsEnum(EnumType)",
    transform: null,
    tsType: "EnumType",
  },
  array: {
    column: "@Column('simple-array')",
    validator: "@IsArray() @IsString({ each: true })",
    transform: null,
    tsType: "string[]",
  },
  json: {
    column: "@Column('json')",
    validator: "@IsOptional()",
    transform: null,
    tsType: "any",
  },
};
```

### 3. 标准字段示例

#### 字符串字段

```typescript
/** 名称 - 必填字符串 */
@Column()
@IsString()
@Length(1, 100)
name: string;

/** 描述 - 可选字符串 */
@Column({ nullable: true })
@IsString()
@IsOptional()
@Length(0, 500)
description?: string;

/** 长文本内容 */
@Column("text", { nullable: true })
@IsString()
@IsOptional()
content?: string;

/** 唯一标识符 */
@Column({ unique: true })
@IsString()
@Length(3, 50)
code: string;
```

#### 数字字段

```typescript
/** 整数字段 */
@Column({ default: 0 })
@IsNumber()
@Type(() => Number)
@IsInt()
@Min(0)
count: number = 0;

/** 评分字段 (1-5) */
@Column({ default: 3 })
@IsNumber()
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
@Max(5)
rating?: number = 3;

/** 金额字段 */
@Column("decimal", { precision: 10, scale: 2, default: 0 })
@IsNumber()
@Type(() => Number)
@Min(0)
amount: number = 0;
```

#### 布尔字段

```typescript
/** 激活状态 */
@Column({ default: false })
@IsBoolean()
@Type(() => Boolean)
isActive: boolean = false;

/** 是否完成 */
@Column({ default: false })
@IsBoolean()
@Type(() => Boolean)
isCompleted: boolean = false;
```

#### 枚举字段

```typescript
/** 状态枚举 - 必填 */
@Column({
  type: "enum",
  enum: ModuleStatus,
  default: ModuleStatus.ACTIVE,
})
@IsEnum(ModuleStatus)
status: ModuleStatus = ModuleStatus.ACTIVE;

/** 类型枚举 - 可选 */
@Column({
  type: "enum",
  enum: ModuleType,
  nullable: true,
})
@IsEnum(ModuleType)
@IsOptional()
type?: ModuleType;
```

#### 日期时间字段

```typescript
/** 开始日期 */
@Column("date")
@IsISO8601()
@Type(() => Date)
startDate: Date = new Date();

/** 结束日期 - 可选 */
@Column("date", { nullable: true })
@IsISO8601()
@IsOptional()
@Type(() => Date)
endDate?: Date;

/** 完成时间 - 可选 */
@Column("datetime", { nullable: true })
@IsOptional()
@Type(() => Date)
completedAt?: Date;
```

#### 数组字段

```typescript
/** 标签数组 */
@Column("simple-array", { nullable: true })
@IsArray()
@IsString({ each: true })
@IsOptional()
tags?: string[] = [];

/** JSON 数组 */
@Column("json", { nullable: true })
@IsArray()
@IsOptional()
metadata?: any[];
```

#### 特殊字段

```typescript
/** 邮箱字段 */
@Column({ unique: true })
@IsEmail()
@IsString()
email: string;

/** URL 字段 */
@Column({ nullable: true })
@IsUrl()
@IsString()
@IsOptional()
website?: string;

/** JSON 对象 */
@Column("json", { nullable: true })
@IsOptional()
settings?: Record<string, any>;
```

## 🔗 关联关系规范

### 1. 一对多关系 (OneToMany/ManyToOne)

```typescript
// 父实体 (一对多)
@OneToMany(() => ChildEntity, (child) => child.parent, {
  cascade: true,
  eager: false
})
children: ChildEntity[];

// 子实体 (多对一)
@ManyToOne(() => ParentEntity, (parent) => parent.children, {
  onDelete: "CASCADE"
})
@JoinColumn({ name: "parent_id" })
parent?: ParentEntity;

@Column({ nullable: true })
@IsString()
@IsOptional()
parentId?: string;
```

### 2. 多对多关系 (ManyToMany)

```typescript
// 主控方
@ManyToMany(() => RelatedEntity, { cascade: true })
@JoinTable({
  name: "module_related",
  joinColumn: { name: "module_id", referencedColumnName: "id" },
  inverseJoinColumn: { name: "related_id", referencedColumnName: "id" },
})
relatedEntities: RelatedEntity[];

// 被控方
@ManyToMany(() => ModuleEntity, (module) => module.relatedEntities)
modules: ModuleEntity[];
```

### 3. 一对一关系 (OneToOne)

```typescript
// 主控方
@OneToOne(() => ProfileEntity, { cascade: true })
@JoinColumn({ name: "profile_id" })
profile?: ProfileEntity;

// 被控方
@OneToOne(() => UserEntity, (user) => user.profile)
user?: UserEntity;
```

### 4. 树形结构关系

```typescript
@Entity("tree_node")
@Tree("closure-table")
export class TreeNode extends BaseEntity {
  /** 父节点 */
  @TreeParent({ onDelete: "CASCADE" })
  parent?: TreeNode;

  /** 子节点 */
  @TreeChildren({ cascade: true })
  children: TreeNode[];

  /** 父节点ID - 冗余字段便于查询 */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}
```

## 🗄️ 数据库约束规范

### 1. 索引约束

```typescript
// 单列索引
@Index()
@Column()
indexedField: string;

// 复合索引
@Index(["field1", "field2"])
@Entity("table_name")
export class EntityName extends BaseEntity {
  @Column()
  field1: string;

  @Column()
  field2: string;
}

// 唯一索引
@Index({ unique: true })
@Column()
uniqueField: string;

// 复合唯一索引
@Index(["userId", "type"], { unique: true })
@Entity("user_setting")
export class UserSetting extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  type: string;
}
```

### 2. 外键约束

```typescript
// 级联删除
@ManyToOne(() => ParentEntity, { onDelete: "CASCADE" })
parent: ParentEntity;

// 设置为空
@ManyToOne(() => ParentEntity, { onDelete: "SET NULL" })
parent?: ParentEntity;

// 限制删除
@ManyToOne(() => ParentEntity, { onDelete: "RESTRICT" })
parent: ParentEntity;
```

## 📊 枚举定义规范

### 1. 枚举命名约定

```typescript
// 文件: module.enum.ts
export enum ModuleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DELETED = "deleted",
}

export enum ModuleType {
  PERSONAL = "personal",
  WORK = "work",
  STUDY = "study",
  HEALTH = "health",
}

export enum ModulePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}
```

### 2. 枚举使用规范

```typescript
// 在 Entity 中使用
@Column({
  type: "enum",
  enum: ModuleStatus,
  default: ModuleStatus.ACTIVE,
})
@IsEnum(ModuleStatus)
status: ModuleStatus = ModuleStatus.ACTIVE;
```

## 🔧 最佳实践

### 1. 命名约定

- **Entity 类名**: PascalCase (如: `UserProfile`)
- **表名**: snake_case (如: `user_profile`)
- **字段名**: camelCase (如: `userName`)
- **枚举名**: PascalCase (如: `UserStatus`)
- **枚举值**: snake_case (如: `active`, `inactive`)

### 2. 字段设计原则

- **必填字段**: 不使用 `nullable: true`，提供合理默认值
- **可选字段**: 使用 `nullable: true` 和 `@IsOptional()`
- **关联字段**: 提供对应的 ID 字段便于查询
- **时间字段**: 统一使用 Date 类型，格式化在 Mapper 层处理

### 3. 性能优化

```typescript
// 避免 eager loading，按需加载
@OneToMany(() => ChildEntity, (child) => child.parent, {
  eager: false  // 默认值，显式声明
})
children: ChildEntity[];

// 合理使用索引
@Index(["status", "createdAt"])  // 常用查询条件
@Entity("task")
export class Task extends BaseEntity {
  @Column()
  status: string;
}
```

### 4. 数据完整性

```typescript
// 使用数据库约束保证数据完整性
@Column({ unique: true })  // 唯一约束
@IsEmail()                 // 应用层验证
email: string;

// 外键约束
@ManyToOne(() => User, { onDelete: "CASCADE" })
user: User;
```

## 🚫 禁止事项

1. **不要在 Entity 中包含业务逻辑** - Entity 仅用于数据模型定义
2. **不要使用 `any` 类型** - 应明确定义具体类型
3. **不要忽略验证装饰器** - 所有字段都应有适当的验证
4. **不要使用复杂的计算字段** - 计算逻辑应在 Service 层
5. **不要在 Entity 中直接使用 Date 对象进行格式化** - 格式化在 Mapper 层处理

## ✅ 检查清单

在创建或修改 Entity 时，请确认以下事项：

### 基础结构

- [ ] 文件命名符合规范 (`{module}.entity.ts`)
- [ ] 类命名符合规范 (PascalCase)
- [ ] 继承了 BaseEntity
- [ ] 表名使用 snake_case
- [ ] 导入顺序正确

### 字段定义

- [ ] 所有字段都有适当的 `@Column()` 装饰器
- [ ] 所有字段都有验证装饰器
- [ ] 可选字段使用 `@IsOptional()`
- [ ] 数字字段使用 `@Type(() => Number)`
- [ ] 布尔字段使用 `@Type(() => Boolean)`
- [ ] 日期字段使用 `@Type(() => Date)`

### 关联关系

- [ ] 关联关系定义正确
- [ ] 外键约束设置合理
- [ ] 级联操作配置正确
- [ ] 提供了对应的 ID 字段

### 数据库约束

- [ ] 唯一字段添加了 `unique: true`
- [ ] 必要的字段添加了索引
- [ ] 外键约束配置正确
- [ ] 默认值设置合理

### 枚举定义

- [ ] 枚举值使用小写字符串
- [ ] 枚举名称语义清晰
- [ ] 在 Entity 中正确使用枚举

### 性能考虑

- [ ] 避免了不必要的 eager loading
- [ ] 添加了必要的索引
- [ ] 关联关系配置合理

## 📝 完整示例

```typescript
// goal.enum.ts
export enum GoalStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum GoalPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// goal.entity.ts
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsISO8601,
  Type,
  Min,
  Max,
  Length,
} from "class-validator";
import { BaseEntity } from "@/base/base.entity";
import { GoalStatus, GoalPriority } from "./goal.enum";
import { Task } from "../task/task.entity";
import { User } from "../user/user.entity";

@Entity("goal")
@Index(["status", "priority"])
@Index(["userId", "status"])
export class Goal extends BaseEntity {
  /** 目标标题 */
  @Column()
  @IsString()
  @Length(1, 100)
  title: string;

  /** 目标描述 */
  @Column("text", { nullable: true })
  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  /** 目标状态 */
  @Column({
    type: "enum",
    enum: GoalStatus,
    default: GoalStatus.ACTIVE,
  })
  @IsEnum(GoalStatus)
  status: GoalStatus = GoalStatus.ACTIVE;

  /** 优先级 */
  @Column({
    type: "enum",
    enum: GoalPriority,
    default: GoalPriority.MEDIUM,
  })
  @IsEnum(GoalPriority)
  priority: GoalPriority = GoalPriority.MEDIUM;

  /** 重要性评分 (1-5) */
  @Column({ default: 3 })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  importance: number = 3;

  /** 是否公开 */
  @Column({ default: false })
  @IsBoolean()
  @Type(() => Boolean)
  isPublic: boolean = false;

  /** 开始日期 */
  @Column("date")
  @IsISO8601()
  @Type(() => Date)
  startDate: Date = new Date();

  /** 目标日期 */
  @Column("date", { nullable: true })
  @IsISO8601()
  @IsOptional()
  @Type(() => Date)
  targetDate?: Date;

  /** 完成时间 */
  @Column("datetime", { nullable: true })
  @IsOptional()
  @Type(() => Date)
  completedAt?: Date;

  /** 标签 */
  @Column("simple-array", { nullable: true })
  @IsOptional()
  tags?: string[] = [];

  /** 关联用户 */
  @ManyToOne(() => User, (user) => user.goals, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  @IsString()
  userId: string;

  /** 关联任务 */
  @OneToMany(() => Task, (task) => task.goal, { cascade: true })
  tasks: Task[];
}
```
