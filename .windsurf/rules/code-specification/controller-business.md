---
trigger: model_decision
description: 编写business Controller代码时
globs:
---
# Business Controller 开发规范

## 📋 概述

Business Controller 是核心业务逻辑层，负责实现业务规则、数据转换和异常处理，是整个分层架构的核心。

## 🏗️ 职责定位

### 核心职责
- **业务逻辑处理**: 实现核心业务规则和流程
- **数据转换**: VO ↔ DTO 数据格式转换
- **异常处理**: 统一异常处理和业务规则验证
- **状态管理**: 业务状态流转和生命周期管理
- **批量操作**: 批量业务操作的处理

### 设计原则
- **纯业务逻辑**: 不依赖具体框架和技术栈
- **可复用性**: 业务逻辑可在多个平台间复用
- **可测试性**: 核心业务逻辑易于单元测试
- **单一职责**: 每个方法职责明确，功能单一

## 📁 文件位置
```
packages/business/server/src/{module}/
├── {module}.controller.ts         # 核心业务控制器
├── {module}.service.ts           # 业务服务
├── dto/                          # 数据传输对象
├── mappers/                      # 数据映射器
└── {module}.repository.ts        # 数据仓储
```

## 🎯 标准模板

### 基础Controller模板
```typescript
import type { {Module} as {Module}VO } from "@life-toolkit/vo";
import { {Module}Service } from "./{module}.service";
import { {Module}Mapper } from "./mappers/{module}.mapper";
import {
  Create{Module}Dto,
  Update{Module}Dto,
  {Module}PageFilterDto,
  {Module}ListFilterDto
} from "./dto";

/**
 * {资源名称}核心业务控制器
 * 位置: packages/business/server/src/{module}/{module}.controller.ts
 */
export class {Module}Controller {
  constructor(private readonly {module}Service: {Module}Service) {}

  /**
   * 创建{资源名称}
   */
  async create(createVo: {Module}VO.Create{Module}Vo): Promise<{Module}VO.{Module}ItemVo> {
    const createDto = {Module}Mapper.voToCreateDto(createVo);
    const dto = await this.{module}Service.create(createDto);
    return {Module}Mapper.dtoToItemVo(dto);
  }

  /**
   * 分页查询{资源名称}列表
   */
  async page(filter: {Module}PageFilterDto): Promise<{Module}VO.{Module}PageVo> {
    const { list, total } = await this.{module}Service.page(filter);
    return {Module}Mapper.dtoToPageVo(list, total, filter.pageNum || 1, filter.pageSize || 10);
  }

  /**
   * 列表查询{资源名称}
   */
  async list(filter: {Module}ListFilterDto): Promise<{Module}VO.{Module}ListVo> {
    const list = await this.{module}Service.findAll(filter);
    return {Module}Mapper.dtoToListVo(list);
  }

  /**
   * 查询{资源名称}详情
   */
  async findDetail(id: string): Promise<{Module}VO.{Module}Vo> {
    const dto = await this.{module}Service.findDetail(id);
    return {Module}Mapper.dtoToVo(dto);
  }

  /**
   * 更新{资源名称}
   */
  async update(id: string, updateVo: {Module}VO.Update{Module}Vo): Promise<{Module}VO.{Module}ItemVo> {
    const updateDto = {Module}Mapper.voToUpdateDto(updateVo);
    const dto = await this.{module}Service.update(id, updateDto);
    return {Module}Mapper.dtoToItemVo(dto);
  }

  /**
   * 删除{资源名称}
   */
  async delete(id: string): Promise<void> {
    await this.{module}Service.delete(id);
  }

  // 状态管理方法
  async abandon(id: string): Promise<{ result: boolean }> {
    const result = await this.{module}Service.abandon(id);
    return { result };
  }

  async restore(id: string): Promise<{ result: boolean }> {
    const result = await this.{module}Service.restore(id);
    return { result };
  }

  async done(id: string): Promise<{ result: boolean }> {
    const result = await this.{module}Service.done(id);
    return { result };
  }

  // 批量操作
  async batchDone(idList: string[]): Promise<void> {
    await this.{module}Service.batchDone(idList);
  }

  async batchDelete(idList: string[]): Promise<void> {
    await this.{module}Service.batchDelete(idList);
  }
}
```

## 📝 使用指南

### 占位符替换规则
- `{Module}` → 模块名，如：`Todo`, `Goal`, `Habit`
- `{module}` → 模块名小写，如：`todo`, `goal`, `habit`
- `{资源名称}` → 中文资源名，如：`待办事项`, `目标`, `习惯`

### 导入路径说明
```typescript
// 相对路径导入 - Business层使用相对路径
import { {Module}Service } from "./{module}.service";
import { {Module}Mapper } from "./mappers/{module}.mapper";
import {
  Create{Module}Dto,
  Update{Module}Dto,
  {Module}PageFilterDto,
  {Module}ListFilterDto
} from "./dto";
```

### 扩展方法模板
```typescript
/**
 * 导出{资源名称}
 */
async export(filter: {Module}ExportFilterDto): Promise<{Module}VO.ExportResultVo> {
  const result = await this.{module}Service.export(filter);
  return {Module}Mapper.exportResultToVo(result);
}

/**
 * 导入{资源名称}
 */
async import(data: {Module}VO.ImportDataVo): Promise<{Module}VO.ImportResultVo> {
  const importDto = {Module}Mapper.voToImportDto(data);
  const result = await this.{module}Service.import(importDto);
  return {Module}Mapper.importResultToVo(result);
}

/**
 * 获取{资源名称}统计信息
 */
async statistics(filter: {Module}StatisticsFilterDto): Promise<{Module}VO.StatisticsVo> {
  const result = await this.{module}Service.getStatistics(filter);
  return {Module}Mapper.statisticsToVo(result);
}
```

## 🔍 最佳实践

### 1. 保持业务纯净
```typescript
// ✅ 推荐做法 - 只关注业务逻辑
export class TodoController {
  async create(createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoItemVo> {
    // 1. 数据转换
    const createDto = TodoMapper.voToCreateDto(createVo);

    // 2. 业务处理
    const dto = await this.todoService.create(createDto);

    // 3. 数据转换
    return TodoMapper.dtoToItemVo(dto);
  }
}

// ❌ 避免的做法 - 包含HTTP相关逻辑
export class TodoController {
  @Post("create") // ❌ 不应该有HTTP装饰器
  async create(@Body() createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoItemVo> {
    // ❌ HTTP相关逻辑不应该出现在Business层
    return await this.todoService.create(createVo);
  }
}
```

### 2. 统一异常处理
```typescript
// 让Service层抛出具体的业务异常
// Business Controller层只负责数据转换
export class TodoController {
  async create(createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoItemVo> {
    try {
      const createDto = TodoMapper.voToCreateDto(createVo);
      const dto = await this.todoService.create(createDto); // Service会抛出业务异常
      return TodoMapper.dtoToVo(dto);
    } catch (error) {
      // 可以在这里添加业务特定的异常转换逻辑
      throw error; // 重新抛出，让上层处理
    }
  }
}
```

### 3. 数据转换规范化
```typescript
// 使用专门的Mapper进行数据转换
export class TodoController {
  async create(createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoItemVo> {
    // 1. VO转DTO
    const createDto = TodoMapper.voToCreateDto(createVo);

    // 2. 调用Service
    const dto = await this.todoService.create(createDto);

    // 3. DTO转VO
    return TodoMapper.dtoToItemVo(dto);
  }
}
```

## 📋 检查清单

### 文件结构检查
- [ ] 文件位置正确：`packages/business/server/src/{module}/{module}.controller.ts`
- [ ] 相关文件存在：service、dto、mapper等
- [ ] 导入路径正确：使用相对路径

### 代码质量检查
- [ ] 类名符合规范：`{Module}Controller`
- [ ] 没有框架相关装饰器（@Controller, @Get等）
- [ ] 方法参数和返回值类型明确
- [ ] 添加完整的JSDoc注释

### 业务逻辑检查
- [ ] 数据转换正确：VO ↔ DTO
- [ ] 异常处理适当：不捕获具体异常类型
- [ ] 方法职责单一：不包含多重业务逻辑
- [ ] 状态管理清晰：状态流转逻辑明确

---

*此文档为Business Controller开发规范，核心业务逻辑实现指南。*
