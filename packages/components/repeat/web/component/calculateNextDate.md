# Repeat 组件测试指南

## 简介

Repeat 组件是一个用于处理重复事件配置的工具包，支持各种复杂的重复模式设置。本文档提供了测试 Repeat 组件的指南和方法，确保各种重复规则正确运行。

## 测试策略

测试 Repeat 组件应该分为以下几个部分：

1. **单元测试**：测试各种重复配置的计算逻辑
2. **集成测试**：测试组件与服务端的交互
3. **UI 测试**：测试前端组件的渲染和交互

## 单元测试

### 1. 重复模式计算测试

测试 `calculateNextDate` 方法，确保它能够正确计算下一个重复日期：

```typescript
import dayjs from 'dayjs';
import { RepeatMode, TimeUnit, WeekDay } from '@life-toolkit/components-repeat';
import { RepeatService } from '@life-toolkit/components-repeat/server/service';

describe('RepeatService.calculateNextDate', () => {
  let service: RepeatService;

  beforeEach(() => {
    // 初始化服务
    service = new RepeatService(/* 注入依赖 */);
  });

  it('应该为每日重复计算正确的下一个日期', () => {
    const currentDate = dayjs('2023-06-15');
    const repeat = {
      repeatMode: RepeatMode.DAILY,
      repeatConfig: {},
    };

    const nextDate = service.calculateNextDate(currentDate, repeat);
    expect(nextDate.format('YYYY-MM-DD')).toBe('2023-06-16');
  });

  // 添加更多测试用例...
});
```

### 2. 重复结束条件测试

测试重复结束的各种方式，例如：

```typescript
it('当重复次数用完时应该结束重复', () => {
  // 设置重复次数为0的场景
});

it('当到达结束日期时应该结束重复', () => {
  // 设置结束日期已过的场景
});
```

## 集成测试

测试 TodoRepeatService 中的 createNextTodo 方法：

```typescript
describe('TodoRepeatService.createNextTodo', () => {
  it('应该创建下一个待办事项', async () => {
    // 测试创建逻辑
  });

  it('当已存在相同日期的待办时不应重复创建', async () => {
    // 测试重复检查
  });
});
```

## UI 测试

使用 React Testing Library 测试前端组件：

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { RepeatSelector } from '@life-toolkit/components-repeat';

describe('RepeatSelector', () => {
  it('应该渲染重复模式选择器', () => {
    render(<RepeatSelector lang="zh-CN" value={{}} onChange={() => {}} />);
    expect(screen.getByText('选择重复模式')).toBeInTheDocument();
  });

  it('切换重复模式时应该调用onChange', () => {
    const onChange = jest.fn();
    render(<RepeatSelector lang="zh-CN" value={{}} onChange={onChange} />);

    // 模拟选择操作
    const select = screen.getByPlaceholderText('选择重复模式');
    fireEvent.change(select, { target: { value: 'daily' } });

    expect(onChange).toHaveBeenCalled();
  });
});
```

## 测试覆盖场景

确保测试覆盖以下关键场景：

1. **基本重复模式**：
   - 不重复 (NONE)
   - 每天 (DAILY)
   - 工作日 (WEEKDAYS)
   - 周末 (WEEKEND)

2. **周重复**：
   - 每周的特定星期几

3. **月重复**：
   - 按日期（例如每月15号）
   - 按序数周（例如每月第一个周一）
   - 按序数日（例如每月最后一天）

4. **年重复**：
   - 按月份日期（例如每年5月15日）
   - 按序数周（例如每年3月的第二个周二）

5. **自定义重复**：
   - 按天间隔（例如每3天）
   - 按周间隔（例如每2周的周一、周三）
   - 按月间隔（例如每3个月的15号）
   - 按年间隔（例如每2年的5月份）

6. **重复结束条件**：
   - 永远重复 (FOREVER)
   - 重复次数 (FOR_TIMES)
   - 截止日期 (TO_DATE)

7. **边界情况**：
   - 月份天数变化（例如2月28/29日）
   - 跨年情况
   - 夏令时变更

## 测试工具

- Jest：JavaScript 测试框架
- React Testing Library：测试 React 组件
- @testing-library/user-event：模拟用户事件
- dayjs：处理日期计算

## 运行测试

```bash
# 运行所有测试
npm test

# 运行特定文件的测试
npm test -- repeat.test.ts

# 运行带有覆盖率报告的测试
npm test -- --coverage
```

## 测试最佳实践

1. 使用具有描述性的测试名称
2. 对每个重复模式单独进行测试
3. 包括边界情况和异常情况
4. 不要依赖于当前日期，始终使用固定的测试日期
5. 测试国际化支持（不同语言环境）
