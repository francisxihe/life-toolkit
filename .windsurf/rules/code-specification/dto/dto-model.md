---
trigger: model_decision
description: 编写server DTO Model代码时
globs:
---
需要生成或修改DTO模型时

# DTO Model 规范

## 📋 概述

DTO Model 是用于数据模型定义的对象，主要包含基础模型DTO和简化模型DTO。本规范定义了Model DTO的标准结构、继承关系和映射逻辑。

## 🎯 标准DTO模型类型定义

### 1. 模型DTO文件 ({module}-model.dto.ts)

#### 基础模板

```typescript
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";
import { {Entity} } from "../{entity}.entity";

// 基础DTO - 包含所有字段
export class {Module}Dto extends IntersectionType(
  BaseModelDto,
  OmitType({Entity}, ["relationField1", "relationField2"] as const)
) {
  // 手动添加关联字段（可选）
  relationField1?: RelatedDto;
  relationField2?: RelatedDto[];
}

// 模型DTO - 排除关联字段，用于简单数据传输
export class {Module}ModelDto extends OmitType({Module}Dto, [
  "relationField1",
  "relationField2",
] as const) {}
```

#### 完整示例（抽象化）

```typescript
// entity-model.dto.ts
import { BaseModelDto } from "../../../base/base-model.dto";
import { OmitType, IntersectionType } from "@life-toolkit/mapped-types";
import { Entity } from "../entity.entity";
import { RelatedDto } from "../../related/dto";

// 基础DTO - 包含所有字段
export class EntityDto extends IntersectionType(
  BaseModelDto,
  OmitType(Entity, ["related"] as const)
) {
  // 关联字段
  related?: RelatedDto;
}

// 模型DTO - 排除关联字段
export class EntityModelDto extends OmitType(EntityDto, [
  "related",
] as const) {}
```

## 🧭 DTO 内置映射方法

### 映射规则

- DTO 类包含内置的数据转换方法，实现 Entity↔DTO↔VO 的双向转换
- 在具体 DTO 类中实现：`importEntity(entity)`、`exportModelVo()`、`exportVo()`
- 列表/分页导出提供静态辅助：`dtoListToListVo(dtoList)`、`dtoListToPageVo(dtoList, total, pageNum, pageSize)`
- 关联对象仅做浅拷贝或调用对方 DTO 的导出方法，避免递归与循环引用
- DTO 内部字段的日期保持为 Date；导出 VO 时统一用 dayjs 格式化为字符串。
- 说明：此处的数据"映射/转换"不属于业务逻辑范畴。

### 映射模板

```typescript
import { BaseModelDto } from "../../../base/base-model.dto";
import { IntersectionType, OmitType } from "@life-toolkit/mapped-types";
import dayjs from "dayjs";
import type { Entity as EntityVO } from "@life-toolkit/vo";
import { Entity } from "../entity.entity";

export class EntityDto extends IntersectionType(
  BaseModelDto,
  OmitType(Entity, ["related"] as const)
) {
  related?: any;

  // Entity → DTO
  importEntity(entity: Entity): EntityDto {
    this.id = entity.id;
    this.name = entity.name;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    // 关联（浅拷贝 / 调用其他 DTO 的导出）
    this.related = entity.related as any;
    return this;
  }

  // 静态方法：创建新实例并导入数据
  static importEntity(entity: Entity): EntityDto {
    return new EntityDto().importEntity(entity);
  }

  // DTO → 业务完整 VO
  exportVo(): EntityVO.EntityVo {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      // 日期统一格式化
      createdAt: dayjs(this.createdAt).toISOString(),
      updatedAt: dayjs(this.updatedAt).toISOString(),
      // 关联对象可按需转换/简化
      related: this.related,
    } as EntityVO.EntityVo;
  }

  // DTO → 列表项 VO（简化）
  exportModelVo(): EntityVO.EntityItemVo {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
    } as EntityVO.EntityItemVo;
  }

  // 可选：列表/分页辅助
  static dtoListToListVo(list: EntityDto[]): EntityVO.EntityListVo {
    return { list: list.map((d) => d.exportModelVo()) };
  }
  
  static dtoListToPageVo(
    list: EntityDto[],
    total: number,
    pageNum: number,
    pageSize: number
  ): EntityVO.EntityPageVo {
    return {
      list: list.map((d) => d.exportModelVo()),
      total,
      pageNum,
      pageSize,
    };
  }
}
```

## 🎯 最佳实践

### 1. 职责分离原则

- **Model DTO**: 数据结构定义，包含所有字段，用于内部传输和API响应
- **关联处理**: 使用ID字段或嵌套DTO，避免循环引用
- **类型安全**: 使用 Mapped Types 复用类型定义

### 2. 类型安全优先

```typescript
// ✅ 推荐：使用 Mapped Types 复用类型定义
export class EntityModelDto extends OmitType(EntityDto, [
  "relationField",
]) {}

// ❌ 避免：手动重复定义字段
export class EntityModelDto {
  id: string;
  name: string;
  status: string;
  // ... 重复字段定义
}
```

### 3. 关联数据处理

```typescript
// 处理关联关系
export class EntityDto extends IntersectionType(
  BaseModelDto,
  OmitType(Entity, ["category", "items"] as const)
) {
  /** 分类关联 */
  category?: CategoryDto;
  
  /** 子项列表 */
  items?: ItemDto[];

  importEntity(entity: Entity) {
    this.id = entity.id;
    this.name = entity.name;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    
    // 关联对象映射
    if (entity.category) {
      this.category = new CategoryDto();
      this.category.importEntity(entity.category);
    }
    
    // 关联列表映射
    if (entity.items?.length) {
      this.items = entity.items.map(item => {
        const itemDto = new ItemDto();
        itemDto.importEntity(item);
        return itemDto;
      });
    }
  }
}
```

## 🚫 禁止事项

1. **不要在Model DTO中包含业务逻辑** - 仅用于数据结构定义和映射
2. **不要使用 `any` 类型** - 应明确定义具体类型
3. **不要创建循环依赖** - 关联DTO应避免相互引用
4. **不要重复定义相同的字段** - 使用 Mapped Types 复用类型定义
5. **不要过度设计** - 只定义实际需要的字段和关联

## ✅ 检查清单

### 基础结构
- [ ] 文件命名符合规范 (`{module}-model.dto.ts`)
- [ ] 类命名符合规范 (`{Module}Dto`, `{Module}ModelDto`)
- [ ] 使用了合适的 Mapped Types (`@life-toolkit/mapped-types`)
- [ ] 正确继承自 `BaseModelDto`

### 继承关系
- [ ] 使用了合适的工具类型 (IntersectionType, OmitType等)
- [ ] 避免了重复的字段定义
- [ ] 继承链清晰合理

### 映射逻辑
- [ ] 实现了 `importEntity()` 方法
- [ ] 实现了 `exportVo()` 和 `exportModelVo()` 方法
- [ ] 日期字段格式化正确
- [ ] 关联对象处理合理

### 代码质量
- [ ] 导入了必要的依赖
- [ ] 避免了循环依赖
- [ ] 注释清晰准确
- [ ] 遵循了项目的编码规范
