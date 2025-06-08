# 日历模块测试

## 概述

日历模块提供事件管理和日历功能的测试，包括事件CRUD操作、ICS导出和日历视图管理。

## 目录结构

```
test/business/calendar/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── events.service.spec.ts   # 事件服务测试 (待开发)
│   └── events.controller.spec.ts # 事件控制器测试 (待开发)
├── integration/                 # 集成测试
│   └── calendar.integration.spec.ts # 日历集成测试 (待开发)
└── utils/                       # 测试工具
    └── events.factory.ts        # 事件测试数据工厂 ✅
```

## 当前状态

### ✅ 已完成
- **测试数据工厂**: EventsTestFactory 完整实现
- **测试数据类型**: 支持多种事件类型和场景
- **边界值测试数据**: 完整的边界值和异常情况数据

### 🔄 进行中
- **单元测试**: 事件服务和控制器测试开发中
- **集成测试**: 端到端日历功能测试规划中

## 功能覆盖计划

### 事件管理 (Event Management)
- [ ] **创建事件**: 单次事件和重复事件创建
- [ ] **查询事件**: 按日期范围、类型、状态查询
- [ ] **更新事件**: 事件信息修改和状态更新
- [ ] **删除事件**: 单个事件和批量删除
- [ ] **重复事件**: 重复规则处理和例外管理

### 日历功能 (Calendar Features)
- [ ] **日历视图**: 月视图、周视图、日视图
- [ ] **事件冲突**: 时间冲突检测和处理
- [ ] **事件提醒**: 提醒设置和通知功能
- [ ] **事件分类**: 事件类型和标签管理
- [ ] **权限控制**: 事件访问权限管理

### 导入导出 (Import/Export)
- [ ] **ICS导出**: 标准ICS格式导出
- [ ] **ICS导入**: 外部日历文件导入
- [ ] **批量操作**: 批量导入导出功能
- [ ] **格式验证**: 文件格式验证和错误处理

## 测试工具

### EventsTestFactory ✅
提供事件测试数据的创建方法：

```typescript
// 创建基础事件DTO
const eventDto = EventsTestFactory.createBasicEventDto();

// 创建事件实体
const event = EventsTestFactory.createEventEntity();

// 创建重复事件
const recurringEvent = EventsTestFactory.createRecurringEvent();

// 创建全天事件
const allDayEvent = EventsTestFactory.createAllDayEvent();

// 创建多个事件
const events = EventsTestFactory.createMultipleEvents(5);

// 创建边界值测试数据
const boundaryData = EventsTestFactory.createBoundaryTestData();

// 创建特定类型事件
const meetingEvent = EventsTestFactory.createMeetingEvent();
const reminderEvent = EventsTestFactory.createReminderEvent();
const taskEvent = EventsTestFactory.createTaskEvent();
```

### 支持的事件类型
- **会议 (Meeting)**: 带参与者的会议事件
- **任务 (Task)**: 待办任务事件
- **提醒 (Reminder)**: 提醒通知事件
- **生日 (Birthday)**: 生日纪念事件
- **假期 (Holiday)**: 节假日事件
- **约会 (Appointment)**: 个人约会事件

## 测试数据特性

### 基础测试数据
- **事件标题**: "测试事件"
- **事件描述**: "这是一个测试事件"
- **开始时间**: 当前时间 + 1小时
- **结束时间**: 当前时间 + 2小时
- **事件类型**: meeting
- **事件状态**: confirmed

### 重复事件数据
- **重复类型**: daily, weekly, monthly, yearly
- **重复间隔**: 1-7天/周/月/年
- **结束条件**: 次数限制或结束日期
- **例外日期**: 跳过特定日期

### 边界值测试
- **最短事件**: 1分钟事件
- **最长事件**: 24小时事件
- **过去事件**: 历史事件数据
- **未来事件**: 远期事件数据
- **特殊字符**: 标题和描述中的特殊字符
- **空值处理**: 可选字段的空值测试

## 计划中的测试用例

### 服务层测试 (EventsService)

#### 事件CRUD测试
```typescript
describe('createEvent', () => {
  // 创建单次事件
  // 创建重复事件
  // 创建全天事件
  // 验证事件冲突检测
});

describe('findEvents', () => {
  // 按日期范围查询
  // 按事件类型过滤
  // 按状态过滤
  // 分页查询
});

describe('updateEvent', () => {
  // 更新事件信息
  // 更新重复事件
  // 处理事件冲突
});

describe('deleteEvent', () => {
  // 删除单个事件
  // 删除重复事件系列
  // 批量删除
});
```

#### 日历功能测试
```typescript
describe('getCalendarView', () => {
  // 月视图数据
  // 周视图数据
  // 日视图数据
});

describe('checkConflicts', () => {
  // 时间冲突检测
  // 资源冲突检测
  // 冲突解决建议
});
```

### 控制器测试 (EventsController)

#### API端点测试
```typescript
describe('POST /events', () => {
  // 创建事件接口
  // 参数验证
  // 错误处理
});

describe('GET /events', () => {
  // 查询事件接口
  // 查询参数处理
  // 分页响应
});

describe('PUT /events/:id', () => {
  // 更新事件接口
  // 权限验证
  // 数据验证
});

describe('DELETE /events/:id', () => {
  // 删除事件接口
  // 权限检查
  // 级联删除
});
```

## 运行测试

```bash
# 运行日历模块所有测试
npm test -- test/business/calendar

# 运行事件服务测试 (待开发)
npm test -- test/business/calendar/unit/events.service.spec.ts

# 运行事件控制器测试 (待开发)
npm test -- test/business/calendar/unit/events.controller.spec.ts

# 运行集成测试 (待开发)
npm test -- test/business/calendar/integration

# 生成覆盖率报告
npm test -- test/business/calendar --coverage
```

## ICS导出测试计划

### ICS格式验证
- [ ] **标准格式**: 符合RFC 5545标准
- [ ] **必需字段**: VEVENT必需属性验证
- [ ] **可选字段**: 扩展属性处理
- [ ] **时区处理**: 时区信息正确处理

### 导出功能测试
- [ ] **单个事件**: 导出单个事件为ICS
- [ ] **多个事件**: 批量导出事件
- [ ] **重复事件**: 重复规则正确导出
- [ ] **文件大小**: 大量事件导出性能

### 导入功能测试
- [ ] **标准ICS**: 导入标准ICS文件
- [ ] **格式验证**: 文件格式验证
- [ ] **错误处理**: 格式错误处理
- [ ] **重复处理**: 重复事件导入处理

## 性能测试计划

### 查询性能
- **单日事件**: < 10ms
- **月度事件**: < 50ms
- **年度事件**: < 200ms
- **复杂查询**: < 500ms

### 批量操作
- **批量创建**: 100个事件 < 1s
- **批量更新**: 100个事件 < 1s
- **批量删除**: 100个事件 < 500ms
- **ICS导出**: 1000个事件 < 2s

## 集成测试计划

### 端到端流程
- [ ] **事件生命周期**: 创建→查询→更新→删除
- [ ] **重复事件管理**: 创建重复事件→修改单次→删除系列
- [ ] **日历视图**: 不同视图的数据一致性
- [ ] **导入导出**: ICS文件完整流程

### 外部集成
- [ ] **邮件通知**: 事件提醒邮件发送
- [ ] **日历同步**: 与外部日历系统同步
- [ ] **权限系统**: 与用户权限系统集成

## 注意事项

1. **时区处理**: 正确处理不同时区的事件
2. **重复规则**: 复杂重复规则的正确实现
3. **性能优化**: 大量事件的查询和渲染性能
4. **数据一致性**: 重复事件修改的数据一致性
5. **用户体验**: 事件冲突和错误的友好提示

## 开发优先级

### 高优先级 (本周)
1. **事件服务测试**: 完成EventsService单元测试
2. **基础CRUD**: 事件的创建、查询、更新、删除测试
3. **数据验证**: 输入数据验证和错误处理测试

### 中优先级 (下周)
1. **控制器测试**: 完成EventsController测试
2. **重复事件**: 重复事件逻辑测试
3. **冲突检测**: 事件时间冲突检测测试

### 低优先级 (后续)
1. **集成测试**: 端到端集成测试
2. **ICS功能**: 导入导出功能测试
3. **性能测试**: 大数据量性能测试

---

*最后更新时间: 2024年12月* 