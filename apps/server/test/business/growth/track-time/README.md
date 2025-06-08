# 时间追踪模块测试

## 概述

时间追踪模块提供时间记录和统计分析功能的测试，包括时间记录CRUD操作、时间统计分析和时间管理功能。

## 目录结构

```
test/business/growth/track-time/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── track-time.service.spec.ts # 时间追踪服务测试 (待开发)
│   ├── track-time.mapper.spec.ts # 数据映射测试 (待开发)
│   └── track-time.controller.spec.ts # 控制器测试 (待开发)
├── integration/                 # 集成测试
│   └── track-time.integration.spec.ts # 集成测试 (待开发)
└── utils/                       # 测试工具
    └── track-time.factory.ts    # 测试数据工厂 (待开发)
```

## 当前状态

### 📋 计划中
- **测试数据工厂**: TrackTimeTestFactory设计和实现
- **单元测试**: 服务、映射器和控制器的单元测试
- **集成测试**: 端到端时间追踪测试
- **统计分析测试**: 时间统计和分析功能测试

## 功能覆盖计划

### 基础时间记录
- [ ] **开始计时**: 开始时间记录
- [ ] **停止计时**: 停止时间记录
- [ ] **暂停计时**: 暂停和恢复计时
- [ ] **手动记录**: 手动添加时间记录
- [ ] **时间修正**: 修正错误的时间记录

### 时间分类管理
- [ ] **活动分类**: 按活动类型分类时间
- [ ] **项目关联**: 时间记录关联项目
- [ ] **标签管理**: 时间记录标签系统
- [ ] **自定义分类**: 用户自定义分类

### 时间统计分析
- [ ] **日统计**: 每日时间统计
- [ ] **周统计**: 每周时间统计
- [ ] **月统计**: 每月时间统计
- [ ] **年统计**: 年度时间统计
- [ ] **趋势分析**: 时间使用趋势分析

### 时间报告
- [ ] **时间报告**: 生成时间使用报告
- [ ] **效率分析**: 时间效率分析
- [ ] **对比分析**: 时间使用对比分析
- [ ] **导出功能**: 时间数据导出

## 模块分析

### 核心组件
- **Entity**: 时间记录实体定义
- **DTO**: 数据传输对象
- **Mapper**: 数据映射器
- **Service**: 业务逻辑服务 (待开发)
- **Controller**: API控制器 (待开发)

### 数据结构
```typescript
// 时间记录实体
interface TrackTimeEntity {
  id: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activity: string;
  description?: string;
  tags?: string[];
  projectId?: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// 时间记录DTO
interface TrackTimeDto {
  startTime: string;
  endTime?: string;
  activity: string;
  description?: string;
  tags?: string[];
  projectId?: number;
}
```

## 测试工具计划

### TrackTimeTestFactory (待开发)
提供时间追踪测试数据的创建方法：

```typescript
// 创建基础时间记录DTO
const trackTimeDto = TrackTimeTestFactory.createBasicTrackTimeDto();

// 创建时间记录实体
const trackTime = TrackTimeTestFactory.createTrackTimeEntity();

// 创建正在进行的时间记录
const activeRecord = TrackTimeTestFactory.createActiveRecord();

// 创建已完成的时间记录
const completedRecord = TrackTimeTestFactory.createCompletedRecord();

// 创建不同活动类型的记录
const workRecord = TrackTimeTestFactory.createWorkRecord();
const studyRecord = TrackTimeTestFactory.createStudyRecord();
const exerciseRecord = TrackTimeTestFactory.createExerciseRecord();

// 创建带标签的记录
const taggedRecord = TrackTimeTestFactory.createTaggedRecord(['工作', '重要']);

// 创建批量时间记录
const records = TrackTimeTestFactory.createMultipleRecords(10);

// 创建边界值测试数据
const boundaryData = TrackTimeTestFactory.createBoundaryTestData();

// 创建统计测试数据
const statisticsData = TrackTimeTestFactory.createStatisticsTestData();
```

## 计划中的测试用例

### 数据映射测试 (TrackTimeMapper)

#### 映射功能测试
```typescript
describe('TrackTimeMapper', () => {
  describe('toEntity', () => {
    // DTO转Entity
    // 数据类型转换
    // 默认值处理
  });

  describe('toDto', () => {
    // Entity转DTO
    // 敏感数据过滤
    // 格式化处理
  });

  describe('toDtoList', () => {
    // 批量转换
    // 空数组处理
    // 性能测试
  });
});
```

### 时间追踪服务测试 (TrackTimeService)

#### 基础功能测试
```typescript
describe('TrackTimeService', () => {
  describe('startTracking', () => {
    // 开始时间追踪
    // 验证必填字段
    // 处理重复开始
  });

  describe('stopTracking', () => {
    // 停止时间追踪
    // 计算持续时间
    // 处理未开始的记录
  });

  describe('pauseTracking', () => {
    // 暂停时间追踪
    // 恢复时间追踪
    // 处理暂停状态
  });

  describe('addManualRecord', () => {
    // 手动添加记录
    // 时间验证
    // 重叠检测
  });
});
```

#### 统计分析测试
```typescript
describe('StatisticsService', () => {
  describe('getDailyStats', () => {
    // 每日统计
    // 按活动分组
    // 时间范围处理
  });

  describe('getWeeklyStats', () => {
    // 每周统计
    // 周开始日期
    // 跨周处理
  });

  describe('getMonthlyStats', () => {
    // 每月统计
    // 月份边界
    // 跨月处理
  });

  describe('getTrendAnalysis', () => {
    // 趋势分析
    // 数据平滑
    // 异常检测
  });
});
```

### 控制器测试 (TrackTimeController)

#### API端点测试
```typescript
describe('TrackTimeController', () => {
  describe('POST /track-time/start', () => {
    // 开始计时接口
    // 参数验证
    // 权限验证
  });

  describe('POST /track-time/stop', () => {
    // 停止计时接口
    // 状态验证
    // 时间计算
  });

  describe('GET /track-time/records', () => {
    // 查询记录接口
    // 分页处理
    // 过滤条件
  });

  describe('GET /track-time/stats', () => {
    // 统计数据接口
    // 时间范围参数
    // 统计类型选择
  });

  describe('PUT /track-time/:id', () => {
    // 更新记录接口
    // 数据验证
    // 权限检查
  });

  describe('DELETE /track-time/:id', () => {
    // 删除记录接口
    // 权限验证
    // 软删除处理
  });
});
```

## 测试数据设计

### 基础测试数据
- **活动**: "工作"
- **描述**: "开发新功能"
- **开始时间**: 当前时间
- **结束时间**: 当前时间 + 2小时
- **持续时间**: 7200秒 (2小时)
- **标签**: ["开发", "重要"]

### 活动类型
- **工作**: 工作相关活动
- **学习**: 学习和培训
- **运动**: 体育锻炼
- **娱乐**: 娱乐休闲
- **家务**: 家务劳动
- **社交**: 社交活动

### 时间记录状态
- **active**: 正在进行
- **paused**: 已暂停
- **completed**: 已完成
- **cancelled**: 已取消

### 统计维度
- **按时间**: 小时、日、周、月、年
- **按活动**: 工作、学习、运动等
- **按项目**: 不同项目的时间分配
- **按标签**: 标签维度统计

## 业务逻辑测试

### 时间计算规则
1. **持续时间**: 结束时间 - 开始时间
2. **暂停处理**: 扣除暂停时间
3. **跨日处理**: 跨日记录的时间分割
4. **时区处理**: 不同时区的时间处理

### 数据验证规则
1. **时间顺序**: 结束时间必须晚于开始时间
2. **时间重叠**: 检测时间记录重叠
3. **最大时长**: 单次记录最大24小时
4. **最小时长**: 单次记录最小1分钟

### 统计计算规则
1. **日统计**: 按自然日统计
2. **周统计**: 按周一到周日统计
3. **月统计**: 按自然月统计
4. **效率计算**: 有效时间 / 总时间

## 性能测试计划

### 查询性能
- **单条记录**: < 5ms
- **日记录查询**: < 20ms
- **月记录查询**: < 100ms
- **年记录查询**: < 500ms

### 统计性能
- **日统计**: < 50ms
- **周统计**: < 100ms
- **月统计**: < 200ms
- **年统计**: < 1s

### 批量操作性能
- **批量插入**: 1000条记录 < 2s
- **批量更新**: 1000条记录 < 2s
- **批量统计**: 10000条记录 < 5s

## 运行测试

```bash
# 运行时间追踪模块所有测试
npm test -- test/business/growth/track-time

# 运行特定组件测试
npm test -- test/business/growth/track-time/unit/track-time.mapper.spec.ts
npm test -- test/business/growth/track-time/unit/track-time.service.spec.ts

# 运行控制器测试
npm test -- test/business/growth/track-time/unit/track-time.controller.spec.ts

# 运行集成测试
npm test -- test/business/growth/track-time/integration

# 生成覆盖率报告
npm test -- test/business/growth/track-time --coverage
```

## 开发优先级

### 高优先级 (第1周)
1. **TrackTimeTestFactory**: 创建测试数据工厂
2. **TrackTimeMapper测试**: 数据映射功能测试
3. **基础服务测试**: 时间记录CRUD操作测试

### 中优先级 (第2周)
1. **统计服务测试**: 时间统计和分析测试
2. **控制器测试**: API端点测试
3. **业务逻辑测试**: 时间计算和验证测试

### 低优先级 (第3周)
1. **性能测试**: 大数据量统计性能测试
2. **集成测试**: 端到端时间追踪测试
3. **边界情况测试**: 异常情况和错误处理测试

## 注意事项

1. **时区处理**: 正确处理不同时区的时间记录
2. **精度问题**: 时间计算的精度和舍入处理
3. **并发安全**: 多设备同时记录时间的安全性
4. **数据一致性**: 确保时间记录和统计的一致性
5. **性能优化**: 大量历史数据的查询和统计性能

## 扩展计划

### 高级功能测试
- [ ] **自动分类**: 基于AI的活动自动分类测试
- [ ] **时间预测**: 基于历史数据的时间预测测试
- [ ] **效率分析**: 时间效率分析算法测试
- [ ] **报告生成**: 自动报告生成测试

### 集成功能测试
- [ ] **与Task模块集成**: 任务时间追踪测试
- [ ] **与Goal模块集成**: 目标时间统计测试
- [ ] **与Calendar模块集成**: 日程时间记录测试

---

*最后更新时间: 2024年12月* 