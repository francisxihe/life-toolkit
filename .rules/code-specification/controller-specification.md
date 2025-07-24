# Controller 层开发规范 v2.0

## 📋 概述

Controller 层是 Life Toolkit 系统的路由控制层，负责处理HTTP请求、参数验证、调用业务逻辑和返回响应。本规范定义了Controller层的标准开发模式、命名约定、路由设计和最佳实践。

## 🏗️ 架构原则

### 分层职责
```
HTTP Request
    ↓
Controller (路由控制、参数验证)
    ↓
Service (业务逻辑)
    ↓
Repository (数据访问)
    ↓
HTTP Response
```

### 核心职责
- **路由定义**: 定义API端点和HTTP方法
- **参数验证**: 验证请求参数和请求体
- **数据转换**: VO ↔ DTO 数据转换
- **异常处理**: 统一异常处理和错误响应
- **响应格式**: 标准化响应格式

## 📁 文件命名规范

### 文件结构
```
{module}/
├── {module}.controller.ts     # 主控制器
├── {module}.service.ts        # 业务服务
├── dto/                       # 数据传输对象
└── mappers/                   # 数据映射器
```

### 命名约定
- **文件名**: `{module}.controller.ts`
- **类名**: `{Module}Controller`
- **装饰器**: `@Controller("{module}")`

## 🛣️ 路由设计规范

### 基础CRUD路由
```typescript
@Controller("goal")
export class GoalController {
  // 创建资源
  @Post("create")
  async create(@Body() createVo: CreateVo): Promise<ItemVo> {}

  // 分页查询
  @Get("page")
  async page(@Query() filter: PageFilterDto): Promise<PageVo> {}

  // 列表查询
  @Get("list")
  async list(@Query() filter: ListFilterDto): Promise<ListVo> {}

  // 详情查询
  @Get("detail/:id")
  async findDetail(@Param("id") id: string): Promise<DetailVo> {}

  // 更新资源
  @Put("update/:id")
  async update(@Param("id") id: string, @Body() updateVo: UpdateVo): Promise<ItemVo> {}

  // 删除资源
  @Delete("delete/:id")
  async delete(@Param("id") id: string): Promise<void> {}
}
```

### 状态操作路由
```typescript
// 状态变更操作使用PUT方法
@Put("abandon/:id")
async abandon(@Param("id") id: string): Promise<{ result: boolean }> {}

@Put("restore/:id")
async restore(@Param("id") id: string): Promise<{ result: boolean }> {}

@Put("done/:id")
async done(@Param("id") id: string): Promise<{ result: boolean }> {}
```

### 批量操作路由
```typescript
// 批量操作使用PUT方法
@Put("batch-done")
async batchDone(@Body() params: { idList: string[] }): Promise<void> {}

@Put("batch-delete")
async batchDelete(@Body() params: { idList: string[] }): Promise<void> {}
```

### 特殊操作路由
```typescript
// 导出操作
@Get("export")
async export(@Query() filter: ExportFilterDto): Promise<ExportVo> {}

// 导入操作
@Post("import")
async import(@Body() data: ImportVo): Promise<ImportResultVo> {}

// 统计操作
@Get("statistics")
async statistics(@Query() filter: StatisticsFilterDto): Promise<StatisticsVo> {}
```

## 🎯 标准模板

### 基础Controller模板
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { {Module}Service } from "./{module}.service";
import { {Module}Mapper } from "./mappers/{module}.mapper";
import type { {Module} as {Module}VO } from "@life-toolkit/vo";
import { 
  Create{Module}Dto, 
  Update{Module}Dto, 
  {Module}PageFilterDto,
  {Module}ListFilterDto 
} from "./dto";

@Controller("{module}")
export class {Module}Controller {
  constructor(private readonly {module}Service: {Module}Service) {}

  /**
   * 创建{资源名称}
   */
  @Post("create")
  async create(@Body() createVo: {Module}VO.Create{Module}Vo): Promise<{Module}VO.{Module}ItemVo> {
    const createDto = {Module}Mapper.voToCreateDto(createVo);
    const dto = await this.{module}Service.create(createDto);
    return {Module}Mapper.dtoToItemVo(dto);
  }

  /**
   * 分页查询{资源名称}列表
   */
  @Get("page")
  async page(@Query() filter: {Module}PageFilterDto): Promise<{Module}VO.{Module}PageVo> {
    const { list, total } = await this.{module}Service.page(filter);
    return {Module}Mapper.dtoToPageVo(list, total, filter.pageNum || 1, filter.pageSize || 10);
  }

  /**
   * 列表查询{资源名称}
   */
  @Get("list")
  async list(@Query() filter: {Module}ListFilterDto): Promise<{Module}VO.{Module}ListVo> {
    const list = await this.{module}Service.findAll(filter);
    return {Module}Mapper.dtoToListVo(list);
  }

  /**
   * 根据ID查询{资源名称}详情
   */
  @Get("detail/:id")
  async findDetail(@Param("id") id: string): Promise<{Module}VO.{Module}Vo> {
    const dto = await this.{module}Service.findDetail(id);
    return {Module}Mapper.dtoToVo(dto);
  }

  /**
   * 更新{资源名称}
   */
  @Put("update/:id")
  async update(
    @Param("id") id: string,
    @Body() updateVo: {Module}VO.Update{Module}Vo
  ): Promise<{Module}VO.{Module}ItemVo> {
    const updateDto = {Module}Mapper.voToUpdateDto(updateVo);
    const dto = await this.{module}Service.update(id, updateDto);
    return {Module}Mapper.dtoToItemVo(dto);
  }

  /**
   * 删除{资源名称}
   */
  @Delete("delete/:id")
  async delete(@Param("id") id: string): Promise<void> {
    await this.{module}Service.delete(id);
  }
}
```

### 带状态管理的Controller模板
```typescript
// 继承基础模板，添加状态管理方法

/**
 * 批量完成{资源名称}
 */
@Put("batch-done")
async batchDone(@Body() params: { idList: string[] }): Promise<void> {
  await this.{module}Service.batchDone(params.idList);
}

/**
 * 放弃{资源名称}
 */
@Put("abandon/:id")
async abandon(@Param("id") id: string): Promise<{ result: boolean }> {
  const result = await this.{module}Service.abandon(id);
  return { result };
}

/**
 * 恢复{资源名称}
 */
@Put("restore/:id")
async restore(@Param("id") id: string): Promise<{ result: boolean }> {
  const result = await this.{module}Service.restore(id);
  return { result };
}

/**
 * 完成{资源名称}
 */
@Put("done/:id")
async done(@Param("id") id: string): Promise<{ result: boolean }> {
  const result = await this.{module}Service.done(id);
  return { result };
}
```

## 开发规范

### 导入规范
```typescript
// 1. NestJS核心装饰器
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";

// 2. 业务服务
import { {Module}Service } from "./{module}.service";

// 3. 数据映射器
import { {Module}Mapper } from "./mappers/{module}.mapper";

// 4. VO类型定义
import type { {Module} as {Module}VO } from "@life-toolkit/vo";

// 5. DTO类型定义
import { 
  Create{Module}Dto, 
  Update{Module}Dto, 
  {Module}PageFilterDto,
  {Module}ListFilterDto 
} from "./dto";
```

### 方法命名规范
```typescript
// 基础CRUD操作
create()      // 创建
page()        // 分页查询
list()        // 列表查询
findDetail()  // 详情查询
update()      // 更新
delete()      // 删除

// 状态操作
abandon()     // 放弃
restore()     // 恢复
done()        // 完成
activate()    // 激活

// 批量操作
batchDone()   // 批量完成
batchDelete() // 批量删除

// 特殊操作
export()      // 导出
import()      // 导入
statistics()  // 统计
```

### 注释规范
```typescript
/**
 * 创建{资源名称}
 * @description 创建新的{资源名称}记录
 * @param createVo 创建参数
 * @returns 创建的{资源名称}信息
 */
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  // 实现逻辑
}
```

### 参数验证规范
```typescript
// 使用DTO进行参数验证
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  // VO转DTO时会自动进行验证
  const createDto = Mapper.voToCreateDto(createVo);
  // ...
}

// 路径参数验证
@Get("detail/:id")
async findDetail(@Param("id") id: string): Promise<DetailVo> {
  // 可以添加参数格式验证
  if (!id || id.trim().length === 0) {
    throw new BadRequestException("ID不能为空");
  }
  // ...
}
```

### 错误处理规范
```typescript
// 使用NestJS标准异常
import { BadRequestException, NotFoundException } from "@nestjs/common";

@Get("detail/:id")
async findDetail(@Param("id") id: string): Promise<DetailVo> {
  try {
    const dto = await this.service.findDetail(id);
    return Mapper.dtoToVo(dto);
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error; // 直接抛出业务异常
    }
    throw new BadRequestException("查询失败"); // 包装其他异常
  }
}
```

## 🔄 数据流转规范

### 请求数据流
```
HTTP Request Body (JSON)
    ↓
VO (前端数据格式)
    ↓ Mapper.voToDto()
DTO (服务层数据格式)
    ↓ Service处理
业务逻辑执行
```

### 响应数据流
```
Service返回结果 (DTO)
    ↓ Mapper.dtoToVo()
VO (前端数据格式)
    ↓
HTTP Response Body (JSON)
```

### 数据转换示例
```typescript
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  // 1. VO转DTO
  const createDto = Mapper.voToCreateDto(createVo);
  
  // 2. 调用业务逻辑
  const dto = await this.service.create(createDto);
  
  // 3. DTO转VO
  return Mapper.dtoToItemVo(dto);
}
```

## 🎨 响应格式规范

### 成功响应格式
```typescript
// 单个资源
{
  id: "uuid",
  name: "资源名称",
  // ... 其他字段
}

// 列表响应
{
  list: [
    { id: "uuid1", name: "资源1" },
    { id: "uuid2", name: "资源2" }
  ]
}

// 分页响应
{
  list: [...],
  total: 100,
  pageNum: 1,
  pageSize: 10
}

// 操作结果响应
{
  result: true
}
```

### 空响应处理
```typescript
// 删除操作返回void
@Delete("delete/:id")
async delete(@Param("id") id: string): Promise<void> {
  await this.service.delete(id);
  // 不需要返回任何内容
}

// 列表为空时返回空数组
{
  list: [],
  total: 0
}
```

## 🔍 最佳实践

### 1. 保持Controller轻量
```typescript
// ✅ 好的做法 - Controller只负责路由和数据转换
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  const createDto = Mapper.voToCreateDto(createVo);
  const dto = await this.service.create(createDto);
  return Mapper.dtoToItemVo(dto);
}

// ❌ 避免的做法 - Controller包含业务逻辑
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  // 业务验证应该在Service层
  if (!createVo.name) {
    throw new BadRequestException("名称不能为空");
  }
  
  // 复杂的数据处理应该在Service层
  const processedData = this.processComplexData(createVo);
  
  // ...
}
```

### 2. 统一异常处理
```typescript
// 让Service层抛出具体的业务异常
// Controller层只负责捕获和转换
@Get("detail/:id")
async findDetail(@Param("id") id: string): Promise<DetailVo> {
  const dto = await this.service.findDetail(id); // Service会抛出NotFoundException
  return Mapper.dtoToVo(dto);
}
```

### 3. 合理使用装饰器
```typescript
// 使用Query装饰器处理查询参数
@Get("page")
async page(@Query() filter: PageFilterDto): Promise<PageVo> {}

// 使用Param装饰器处理路径参数
@Get("detail/:id")
async findDetail(@Param("id") id: string): Promise<DetailVo> {}

// 使用Body装饰器处理请求体
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {}
```

### 4. 避免直接操作数据库
```typescript
// ✅ 好的做法 - 通过Service层操作
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  const createDto = Mapper.voToCreateDto(createVo);
  const dto = await this.service.create(createDto); // Service处理数据库操作
  return Mapper.dtoToItemVo(dto);
}

// ❌ 避免的做法 - Controller直接操作Repository
@Post("create")
async create(@Body() createVo: CreateVo): Promise<ItemVo> {
  const entity = await this.repository.create(createVo); // 跳过了Service层
  return entity;
}
```

## 📋 检查清单

### 文件结构检查
- [ ] 文件命名符合 `{module}.controller.ts` 格式
- [ ] 类名符合 `{Module}Controller` 格式
- [ ] 使用 `@Controller("{module}")` 装饰器
- [ ] 正确导入所需的依赖

### 路由设计检查
- [ ] 基础CRUD路由完整 (create, page, list, detail, update, delete)
- [ ] 路由命名清晰明确
- [ ] HTTP方法使用正确 (POST/GET/PUT/DELETE)
- [ ] 参数装饰器使用正确 (@Body/@Param/@Query)

### 数据转换检查
- [ ] 使用Mapper进行VO↔DTO转换
- [ ] 输入参数使用VO类型
- [ ] 返回结果使用VO类型
- [ ] 不直接暴露DTO或Entity

### 代码质量检查
- [ ] 添加完整的JSDoc注释
- [ ] 方法命名清晰明确
- [ ] 保持方法简洁，避免复杂逻辑
- [ ] 正确处理异常情况

### 响应格式检查
- [ ] 返回类型明确定义
- [ ] 响应格式符合规范
- [ ] 空值处理正确
- [ ] 错误响应统一

## 🔮 扩展指南

### 添加新的路由
```typescript
// 1. 定义路由方法
@Get("custom-action/:id")
async customAction(@Param("id") id: string): Promise<CustomVo> {
  const result = await this.service.customAction(id);
  return Mapper.customToVo(result);
}

// 2. 在Service中实现业务逻辑
// 3. 在Mapper中添加数据转换方法
// 4. 更新VO类型定义
```

### 添加中间件支持
```typescript
// 使用NestJS中间件、守卫、拦截器
import { UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@/guards/auth.guard";
import { LoggingInterceptor } from "@/interceptors/logging.interceptor";

@Controller("goal")
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class GoalController {
  // ...
}
```