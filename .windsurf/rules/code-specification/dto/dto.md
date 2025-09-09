---
trigger: model_decision
description: 编写server DTO代码时
globs:
---

需要生成或修改DTO时

# DTO 规范总览

## 📋 概述

DTO (Data Transfer Object) 是用于数据传输的对象，主要用于控制器层的数据验证、转换和传输。本规范定义了DTO模块的标准结构、命名约定和最佳实践。

## 🏗️ 目录结构规范

### 基础结构

```
apps/server/src/business/{domain}/{module}/dto/
├── {module}-model.dto.ts      # 基础模型DTO
├── {module}-form.dto.ts       # 表单操作DTO
├── {module}-filter.dto.ts     # 过滤查询DTO
└── index.ts                   # 导出文件
```

### 实际项目结构示例

```
packages/business/server/src/growth/{module}/dto/
├── {module}-model.dto.ts      # 基础模型DTO
├── {module}-form.dto.ts       # 表单操作DTO
├── {module}-filter.dto.ts     # 过滤查询DTO
└── index.ts                   # 导出文件
```

## 📝 文件命名规范

### 文件命名格式

- **模型DTO**: `{module}-model.dto.ts`
- **表单DTO**: `{module}-form.dto.ts`
- **过滤DTO**: `{module}-filter.dto.ts`
- **导出文件**: `index.ts`

### 类命名格式

- **基础模型**: `{Module}Dto` (包含所有字段)
- **简化模型**: `{Module}ModelDto` (排除关联字段)
- **创建表单**: `Create{Module}Dto`
- **更新表单**: `Update{Module}Dto`
- **列表过滤**: `{Module}ListFilterDto`
- **分页过滤**: `{Module}PageFilterDto`

## 📚 子规范详情

本规范包含以下子规范，请根据具体需求参考对应规范：

### 1. DTO Model 规范 (@dto-model.mdc)

- 基础模型DTO和简化模型DTO的定义
- Entity→DTO、DTO→VO的映射逻辑
- 关联数据处理和类型安全设计

### 2. DTO Form 规范 (@dto-form.mdc)

- 创建DTO和更新DTO的定义
- 表单验证规则和字段映射
- 关联数据处理和嵌套DTO设计

### 3. DTO Filter 规范 (@dto-filter.mdc)

- 列表过滤DTO和分页过滤DTO的定义
- 查询条件验证和VO映射逻辑
- 复杂过滤模式和性能优化

## 🎯 快速参考

### 导出文件 (index.ts)

```typescript
// 重新导出所有DTO
export * from './{module}-model.dto';
export * from './{module}-form.dto';
export * from './{module}-filter.dto';
```

### 实际项目示例

```typescript
// index.ts
export * from './entity-filter.dto';
export * from './entity-form.dto';
export * from './entity-model.dto';
```

## 🔧 通用工具和最佳实践

### 1. Mapped Types 工具类型

```typescript
import {
  PickType, // 选择特定字段
  OmitType, // 排除特定字段
  PartialType, // 所有字段变为可选
  IntersectionType, // 合并多个类型
} from '@life-toolkit/mapped-types';
```

### 2. 继承链设计

```typescript
// 基础继承链
BaseModelDto → {Module}Dto → {Module}ModelDto
                          → Create{Module}Dto → Update{Module}Dto

// 过滤继承链
PageFilterDto → {Module}PageFiltersDto
{Module}Dto → {Module}ListFilterDto → {Module}PageFiltersDto
```

### 3. 验证装饰器

```typescript
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  IsOptional,
  IsISO8601,
  IsInt,
  IsEmail,
  IsUrl,
  Min,
  Max,
  Length,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
```

## 🎯 最佳实践

### 职责分离原则

- **Model DTO**: 数据结构定义，包含所有字段，用于内部传输和API响应
- **Form DTO**: 表单操作验证，包含创建和更新所需的字段
- **Filter DTO**: 查询条件验证，包含列表和分页的过滤参数

### 类型安全优先

```typescript
// ✅ 推荐：使用 Mapped Types 复用类型定义
export class UpdateEntityDto extends PartialType(CreateEntityDto) {}

// ❌ 避免：手动重复定义字段
export class UpdateEntityDto {
  title?: string;
  description?: string;
  // ... 重复字段定义
}
```

## 🧭 映射逻辑合并至 DTO

- 将 Entity→DTO、DTO→VO、VO→DTO 的转换统一放入对应 DTO 文件中
- 建议在具体 DTO 类中实现：`importEntity(entity)`、`exportWithoutRelationsVo()`、`exportVo()`
- 列表/分页导出可提供静态辅助：`dtoListToListVo(dtoList)`、`dtoListToPageVo(dtoList, total, pageNum, pageSize)`
- 关联对象仅做浅拷贝或调用对方 DTO 的导出方法，避免递归与循环引用
- DTO 内部字段的日期保持为 Date；导出 VO 时统一用 dayjs 格式化为字符串

### 映射模板示例

```typescript
export class EntityDto extends IntersectionType(BaseModelDto, OmitType(Entity, ['related'] as const)) {
  related?: any;

  // Entity → DTO
  importEntity(entity: Entity) {
    Object.assign(this, BaseMapper.entityToDto(entity));
    this.related = entity.related as any;
  }

  // DTO → 业务完整 VO
  exportVo(): EntityVO.EntityVo {
    return {
      ...BaseMapper.dtoToVo(this),
      // 日期统一格式化
      // scheduledDate: this.scheduledDate ? dayjs(this.scheduledDate).format("YYYY-MM-DD") : undefined,
      related: this.related,
    } as EntityVO.EntityVo;
  }

  // DTO → 列表项 VO（简化）
  exportWithoutRelationsVo(): EntityVO.EntityItemVo {
    return {
      ...BaseMapper.dtoToVo(this),
    } as EntityVO.EntityItemVo;
  }
}
```

## 🚫 禁止事项

1. **不要在DTO中包含业务逻辑** - DTO仅用于数据传输和验证，复杂逻辑应在Service层
2. **不要使用 `any` 类型** - 应明确定义具体类型，避免类型安全问题
3. **不要忽略验证装饰器** - 所有字段都应有适当的验证规则
4. **不要重复定义相同的字段** - 使用 Mapped Types 复用类型定义
5. **不要在DTO中直接操作数据库** - 数据操作应在 Service/Repository 层
6. **不要创建循环依赖** - DTO之间应避免相互引用
7. **不要过度设计** - 只定义实际需要的字段和验证规则

## ✅ 检查清单

在创建或修改DTO时，请确认以下事项：

### 基础结构

- [ ] 文件命名符合规范 (`{module}-{type}.dto.ts`)
- [ ] 类命名符合规范 (`{Module}{Type}Dto`)
- [ ] 使用了合适的 Mapped Types (`@life-toolkit/mapped-types`)
- [ ] 导入了必要的验证装饰器

### 继承关系

- [ ] 正确继承自 `BaseModelDto`
- [ ] 使用了合适的工具类型 (PickType, OmitType, PartialType等)
- [ ] 避免了重复的字段定义
- [ ] 继承链清晰合理

### 验证规则

- [ ] 所有字段都有适当的验证装饰器
- [ ] 可选字段使用了 `@IsOptional()`
- [ ] 数字字段使用了 `@Type(() => Number)`
- [ ] 日期字段使用了 `@IsISO8601()` 或 `@IsDateString()`
- [ ] 枚举字段使用了 `@IsEnum()`
- [ ] 数组字段使用了 `@IsArray()`
- [ ] 字符串数组使用了 `@IsString({ each: true })`

### 字段设计

- [ ] 字段类型定义正确
- [ ] 关联字段处理合理（使用ID列表或嵌套DTO）
- [ ] 过滤条件完整且实用
- [ ] 默认值设置合理

### 代码质量

- [ ] 导入了必要的依赖
- [ ] 避免了循环依赖
- [ ] 注释清晰准确
- [ ] 遵循了项目的编码规范
