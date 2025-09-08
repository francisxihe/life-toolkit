---
trigger: model_decision
description: 编写server Controller代码时
globs:
---
# Server Adapter Controller 开发规范

## 📋 概述

Server Adapter Controller 是Server端的适配层，负责将NestJS的HTTP请求适配到核心业务控制器，是连接前端和业务逻辑的桥梁。

## 🏗️ 职责定位

### 核心职责
- **HTTP接口适配**: 处理HTTP请求和响应
- **路由定义**: 定义RESTful API路由
- **参数验证**: 验证请求参数和路径参数
- **异常转换**: 将业务异常转换为HTTP异常
- **响应格式化**: 格式化HTTP响应

### 设计原则
- **薄适配层**: 只做适配，不包含业务逻辑
- **标准REST**: 遵循RESTful API设计规范
- **统一异常**: 统一HTTP异常处理和响应格式
- **参数验证**: 严格的参数验证和类型检查

## 📁 文件位置
```
apps/server/src/business/{module}/
├── {module}.controller.ts        # Server适配控制器
└── {module}.module.ts           # NestJS模块定义
```

## 🎯 标准模板

### 基础Controller模板
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { {Module}Controller } from "@life-toolkit/business-server";
import type { {Module} as {Module}VO } from "@life-toolkit/vo";
import {
  {Module}PageFilterDto,
  {Module}ListFilterDto
} from "@life-toolkit/business-server";

/**
 * {资源名称}Server适配控制器
 * 位置: apps/server/src/business/{module}/{module}.controller.ts
 */
@Controller("{module}")
export class {Module}ServerController {
  constructor(private readonly {module}Controller: {Module}Controller) {}

  /**
   * 创建{资源名称}
   */
  @Post("create")
  async create(@Body() createVo: {Module}VO.Create{Module}Vo): Promise<{Module}VO.{Module}ModelVo> {
    return await this.{module}Controller.create(createVo);
  }

  /**
   * 分页查询{资源名称}列表
   */
  @Get("page")
  async page(@Query() filter: {Module}PageFilterDto): Promise<{Module}VO.{Module}ResponsePageVo> {
    return await this.{module}Controller.page(filter);
  }

  /**
   * 列表查询{资源名称}
   */
  @Get("list")
  async list(@Query() filter: {Module}ListFilterDto): Promise<{Module}VO.{Module}ListVo> {
    return await this.{module}Controller.list(filter);
  }

  /**
   * 查询{资源名称}详情
   */
  @Get("detail/:id")
  async findDetail(@Param("id") id: string): Promise<{Module}VO.{Module}Vo> {
    return await this.{module}Controller.findDetail(id);
  }

  /**
   * 更新{资源名称}
   */
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() updateVo: {Module}VO.Update{Module}Vo
  ): Promise<{Module}VO.{Module}ModelVo> {
    return await this.{module}Controller.update(id, updateVo);
  }

  /**
   * 删除{资源名称}
   */
  @Delete("delete/:id")
  async delete(@Param("id") id: string): Promise<void> {
    await this.{module}Controller.delete(id);
  }

  // 状态管理路由
  @Put("abandon/:id")
  async abandon(@Param("id") id: string): Promise<{ result: boolean }> {
    return await this.{module}Controller.abandon(id);
  }

  @Put("restore/:id")
  async restore(@Param("id") id: string): Promise<{ result: boolean }> {
    return await this.{module}Controller.restore(id);
  }

  @Put("done/:id")
  async done(@Param("id") id: string): Promise<{ result: boolean }> {
    return await this.{module}Controller.done(id);
  }

  // 批量操作路由
  @Put("done/batch")
  async doneBatch(@Body() params: { includeIds: string[] }): Promise<void> {
    await this.{module}Controller.doneBatch(params.includeIds);
  }

  @Put("batch-delete")
  async batchDelete(@Body() params: { includeIds: string[] }): Promise<void> {
    await this.{module}Controller.batchDelete(params.includeIds);
  }
}
```

### NestJS模块定义模板
```typescript
import { Module } from "@nestjs/common";
import { {Module}ServerController } from "./{module}.controller";
import { {Module}Controller } from "@life-toolkit/business-server";

/**
 * {资源名称}模块定义
 * 位置: apps/server/src/business/{module}/{module}.module.ts
 */
@Module({
  controllers: [{Module}ServerController],
  providers: [{Module}Controller],
  exports: [{Module}Controller]
})
export class {Module}Module {}
```

## 📝 使用指南

### 占位符替换规则
- `{Module}` → 模块名，如：`Todo`, `Goal`, `Habit`
- `{module}` → 模块名小写，如：`todo`, `goal`, `habit`
- `{资源名称}` → 中文资源名，如：`待办事项`, `目标`, `习惯`

### 导入路径说明
```typescript
// Server适配层使用包路径导入核心业务控制器
import { {Module}Controller } from "@life-toolkit/business-server";
import type { {Module} as {Module}VO } from "@life-toolkit/vo";

// NestJS装饰器
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
```

### 路由设计规范
```typescript
@Controller("{module}")  // 控制器路由前缀
export class {Module}ServerController {

  @Post("create")        // 创建资源
  @Get("page")           // 分页查询
  @Get("list")           // 列表查询
  @Get("detail/:id")     // 详情查询
  @Put("update/:id")     // 更新资源
  @Delete("delete/:id")  // 删除资源

  // 状态管理
  @Put("abandon/:id")    // 放弃资源
  @Put("restore/:id")    // 恢复资源
  @Put("done/:id")       // 完成资源

  // 批量操作
  @Put("done/batch")     // 批量完成
  @Put("batch-delete")   // 批量删除
}
```

## 🔍 最佳实践

### 1. 保持适配层轻薄
```typescript
// ✅ 推荐做法 - 只做适配，不包含业务逻辑
@Controller("todo")
export class TodoServerController {
  constructor(private readonly todoController: TodoController) {}

  @Post("create")
  async create(@Body() createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoWithoutRelationsVo> {
    // 直接调用核心业务控制器
    return await this.todoController.create(createVo);
  }
}

// ❌ 避免的做法 - 在适配层添加业务逻辑
@Controller("todo")
export class TodoServerController {
  @Post("create")
  async create(@Body() createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoWithoutRelationsVo> {
    // ❌ 不应该在适配层做参数验证
    if (!createVo.title) {
      throw new BadRequestException("标题不能为空");
    }

    // ❌ 不应该在适配层做业务处理
    const result = await this.todoService.create(createVo);
    return result;
  }
}
```

### 2. 统一异常处理
```typescript
import { BadRequestException, NotFoundException, InternalServerErrorException } from "@nestjs/common";

@Controller("todo")
export class TodoServerController {
  constructor(private readonly todoController: TodoController) {}

  @Get("detail/:id")
  async findDetail(@Param("id") id: string): Promise<TodoVO.TodoVo> {
    try {
      return await this.todoController.findDetail(id);
    } catch (error) {
      // 将业务异常转换为HTTP异常
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`{资源名称}不存在`);
      }
      throw new InternalServerErrorException("查询{资源名称}详情失败");
    }
  }
}
```

### 3. 参数验证和转换
```typescript
import { Body, Param, Query, BadRequestException } from "@nestjs/common";

@Controller("todo")
export class TodoServerController {
  @Post("create")
  async create(@Body() createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoWithoutRelationsVo> {
    // HTTP参数验证可以在这里进行
    return await this.todoController.create(createVo);
  }

  @Get("detail/:id")
  async findDetail(@Param("id") id: string): Promise<TodoVO.TodoVo> {
    // 路径参数验证
    if (!id || id.trim().length === 0) {
      throw new BadRequestException("ID不能为空");
    }

    return await this.todoController.findDetail(id);
  }

  @Get("page")
  async page(@Query() filter: TodoPageFilterDto): Promise<TodoVO.TodoPageVo> {
    // 查询参数处理
    const pageNum = Math.max(1, filter.pageNum || 1);
    const pageSize = Math.min(100, Math.max(1, filter.pageSize || 10));

    return await this.todoController.page({ ...filter, pageNum, pageSize });
  }
}
```

## 📋 检查清单

### 文件结构检查
- [ ] 文件位置正确：`apps/server/src/business/{module}/{module}.controller.ts`
- [ ] 模块文件存在：`{module}.module.ts`
- [ ] 导入路径正确：使用包路径导入核心控制器

### 代码质量检查
- [ ] 类名符合规范：`{Module}ServerController`
- [ ] 使用正确的NestJS装饰器
- [ ] 方法参数装饰器正确（@Body, @Param, @Query）
- [ ] 添加完整的JSDoc注释

### HTTP规范检查
- [ ] 路由设计符合RESTful规范
- [ ] HTTP方法使用正确（GET, POST, PUT, DELETE）
- [ ] 控制器路由前缀正确
- [ ] 参数验证适当

### 异常处理检查
- [ ] 统一异常处理机制
- [ ] 业务异常正确转换
- [ ] HTTP状态码正确
- [ ] 错误信息清晰明确

---

*此文档为Server Adapter Controller开发规范，NestJS HTTP接口适配指南。*