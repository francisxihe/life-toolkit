# Repeat 组件

## 简介
Repeat 组件是一个用于处理重复事件配置的工具包，支持各种复杂的重复模式设置，类似于日历应用中的重复事件设置功能。它提供了完整的前端UI组件和后端服务支持，可以轻松集成到需要重复事件功能的应用中。

## 安装
```bash
# 使用 npm
npm install @life-toolkit/components-repeat

# 使用 yarn
yarn add @life-toolkit/components-repeat
```

## 基本用法
```javascript
import { RepeatSelector } from '@life-toolkit/components-repeat';
import { useState } from 'react';

function App() {
  const [value, setValue] = useState();
  
  return (
    <RepeatSelector 
      lang="zh-CN" 
      value={value} 
      onChange={(newValue) => setValue(newValue)} 
    />
  );
}
```

## 重复规则详解

### 重复模式 (RepeatMode)
Repeat 组件支持以下重复模式：

- **不重复 (NONE)**: 事件不重复
- **每天 (DAILY)**: 事件每天重复
- **每周 (WEEKLY)**: 事件在每周的特定星期几重复
- **每月 (MONTHLY)**: 事件在每月的特定日期或特定星期几重复
- **每年 (YEARLY)**: 事件在每年的特定月份特定日期重复
- **工作日 (WEEKDAYS)**: 事件在每周的工作日（周一至周五）重复
- **周末 (WEEKEND)**: 事件在每周的周末（周六、周日）重复
- **工作日 (WORKDAYS)**: 根据工作日历重复（一般为法定工作日）
- **休息日 (REST_DAY)**: 根据休息日日历重复
- **自定义 (CUSTOM)**: 按自定义间隔重复

### 每周重复配置
可以选择一周中的一天或多天进行重复：
- 周一至周日 (MONDAY - SUNDAY)

### 每月重复配置
每月重复支持三种类型：
1. **按日期重复 (DAY)**：例如每月的15号
2. **按序数周重复 (ORDINAL_WEEK)**：例如每月的第一个周一
3. **按序数日重复 (ORDINAL_DAY)**：例如每月的最后一天

### 每年重复配置
每年重复支持两种类型：
1. **按月份重复 (MONTH)**：例如每年5月15日
2. **按序数周重复 (ORDINAL_WEEK)**：例如每年3月的第二个周二

### 自定义重复配置
自定义重复允许设置间隔单位和数量，支持：
- 天 (DAY)：例如每3天
- 周 (WEEK)：例如每2周的周一、周三
- 月 (MONTH)：例如每3个月的15号
- 年 (YEAR)：例如每2年的5月份

### 重复结束模式 (RepeatEndMode)
事件重复可以按以下方式结束：

- **永远重复 (FOREVER)**: 没有结束日期
- **重复次数 (FOR_TIMES)**: 重复指定的次数后结束
- **截止日期 (TO_DATE)**: 到达指定日期后结束

## API 参考

### RepeatSelector 组件
| 属性 | 类型 | 默认值 | 描述 |
|-----|------|-------|------|
| lang | 'en-US' \| 'zh-CN' | - | 组件语言 |
| value | RepeatModeForm & RepeatEndModeForm | - | 重复配置的值 |
| onChange | (value: RepeatModeForm & RepeatEndModeForm) => void | - | 值变更时的回调函数 |

## 服务端集成
Repeat 组件提供了完整的服务端支持，包括：

- 实体类定义 (entity.ts)
- 数据传输对象 (dto.ts)
- 服务类实现 (service.ts)
- 数据映射工具 (mapper.ts)

可以轻松集成到 NestJS 应用中使用。

