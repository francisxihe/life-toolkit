# Desktop RouteController（IPC 入口）开发规范

## 概述

Desktop 主进程的 **RouteController**（`*.route-controller.ts`）是 Growth 模块的 **唯一 Controller**：

- 对外：HTTP 风格 REST 路径 + VO（由 `electron-ipc-restful` 注册到 IPC channel `REST`）
- 对内：VO ↔ DTO，调用模块 Service

历史上存在的 `*.controller.ts` IPC 透传适配层已删除；仅在未来出现「Desktop 与独立 HTTP Server 行为不一致」时再抽独立 adapter。

## 职责定位

| 做 | 不做 |
| --- | --- |
| 声明路由与参数绑定（`@Controller` / `@Get` …） | 业务规则（放 Service） |
| VO → DTO.import\*Vo / DTO.exportVo → VO | 直接操作 Repository / Entity |
| 默认注入模块 service 单例 | 维护第二份透传方法列表 |

装饰器来自 `@business/decorators`：桥接 `electron-ipc-restful`，并保留 `description` 等静态元数据。

## 文件位置

```
apps/desktop/src/service/growth/{module}/
├── {module}.route-controller.ts   # IPC + VO 边界（唯一 Controller）
├── {module}.service.ts
├── dto/
└── index.ts                       # export route-controller
```

注册入口：`apps/desktop/src/main/ipc-handlers.ts`。

## 标准模板

```typescript
import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@business/decorators';
import type { Goal as GoalVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { CreateGoalDto, UpdateGoalDto, GoalFilterDto, GoalPageFilterDto, GoalDto } from './dto';
import { GoalService, goalService as defaultGoalService } from './goal.service';

@Controller('/goal')
export class GoalController {
  /** 默认注入模块单例，供 electron-ipc-restful 无参实例化 */
  constructor(private readonly goalService: GoalService = defaultGoalService) {}

  @Post('/create', { description: '创建目标' })
  async create(@Body() body: GoalVO.CreateGoalVo): Promise<GoalVO.GoalVo> {
    const createDto = new CreateGoalDto();
    createDto.importCreateVo(body);
    const dto = await this.goalService.create(createDto);
    return dto.exportVo();
  }

  @Get('/page', { description: '分页查询目标列表' })
  async page(
    @Query() goalPageFilterVo?: GoalVO.GoalPageFilterVo
  ): Promise<ResponsePageVo<GoalVO.GoalWithoutRelationsVo>> {
    const filter = new GoalPageFilterDto();
    filter.importPageVo(goalPageFilterVo ?? { pageNum: 1, pageSize: 10 });
    const { list, total, pageNum, pageSize } = await this.goalService.page(filter);
    return GoalDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Put('/update/:id', { description: '更新目标' })
  async update(@Param('id') id: string, @Body() body: GoalVO.UpdateGoalVo): Promise<GoalVO.GoalVo> {
    const updateDto = new UpdateGoalDto();
    updateDto.id = id;
    updateDto.importUpdateVo(body);
    const dto = await this.goalService.update(updateDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除目标' })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.goalService.delete(id);
  }
}
```

## IPC 注册

```typescript
// apps/desktop/src/main/ipc-handlers.ts
import { registerIpcHandlers } from 'electron-ipc-restful';
import { GoalController } from '../service/growth/goal/goal.route-controller';
// ... HabitController, TaskController, TodoController, TrackTimeController

export function initIpcRouter(): void {
  registerIpcHandlers({
    controllers: [GoalController, HabitController, TaskController, TodoController, TrackTimeController],
  });
}
```

注意：`electron-ipc-restful` 对 **Class** 取 `@Controller` 前缀元数据；对实例取前缀可能为空。因此注册 **Class**，并用构造器默认参数完成 DI。

## 客户端 API 对齐

SSOT 为 `*.route-controller.ts`，与 `@true-north/web-service` 的 controller / growth 路径手写对齐。历史上的 Desktop Proxy（`*.controller.ts`）和 dev-tools 代码生成已下线。

## 何时再引入 Adapter

仅当需要同时服务「独立 HTTP 服务实现」与「Desktop 本地差异」（路径、鉴权、异常形态不一致）时，再增加薄适配层；默认不要为透传再拆文件。

## 相关文档

- [desktop-layers.md](../../architecture/desktop-layers.md)
- [data-flow.md](../../architecture/data-flow.md)
