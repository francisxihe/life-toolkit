# 中国日历工具库

一个用于处理中国工作日、节假日和补班日的 TypeScript 工具库。基于官方节假日安排，提供各种维度的日期信息查询功能。

## 功能特性

- ✅ 判断指定日期是否为工作日/节假日/补班日
- ✅ 获取指定年份/月份的所有工作日和非工作日
- ✅ 获取节假日详细信息和补班日安排
- ✅ 计算日期范围内的工作日天数
- ✅ 获取下一个/上一个工作日
- ✅ 年度和月度统计信息
- ✅ 完整的 TypeScript 类型支持
- ✅ 支持 2023-2025 年数据

## 安装

```bash
pnpm install @life-toolkit/calendar
```

## 基础用法

### 导入方式

```typescript
// 方式1: 使用便捷函数
import { isWorkday, isHoliday, getDateInfo } from '@life-toolkit/calendar';

// 方式2: 使用类实例
import { ChineseCalendar } from '@life-toolkit/calendar';
const calendar = new ChineseCalendar();

// 方式3: 使用默认实例
import { calendar } from '@life-toolkit/calendar';
```

### 基本日期判断

```typescript
import { isWorkday, isHoliday, isMakeupDay, getDateInfo } from '@life-toolkit/calendar';

// 判断是否为工作日
console.log(isWorkday('2024-01-01')); // false (元旦)
console.log(isWorkday('2024-01-02')); // true (工作日)
console.log(isWorkday('2024-02-04')); // true (春节补班日)

// 判断是否为节假日
console.log(isHoliday('2024-01-01')); // true (元旦)
console.log(isHoliday('2024-02-10')); // true (春节)

// 判断是否为补班日
console.log(isMakeupDay('2024-02-04')); // true (春节补班)

// 获取详细日期信息
const dateInfo = getDateInfo('2024-01-01');
console.log(dateInfo);
// {
//   date: '2024-01-01',
//   type: 'holiday',
//   isWorkday: false,
//   holiday: { Name: '元旦', StartDate: '2024-01-01', ... },
//   dayOfWeek: 1
// }
```

### 获取工作日和非工作日

```typescript
import { 
  getWorkdaysInYear, 
  getNonWorkdaysInYear,
  getWorkdaysInMonth,
  getNonWorkdaysInMonth 
} from '@life-toolkit/calendar';

// 获取2024年所有工作日
const workdays2024 = getWorkdaysInYear(2024);
console.log(`2024年共有 ${workdays2024.length} 个工作日`);

// 获取2024年所有非工作日
const nonWorkdays2024 = getNonWorkdaysInYear(2024);
console.log(`2024年共有 ${nonWorkdays2024.length} 个非工作日`);

// 获取2024年1月的工作日
const workdaysJan2024 = getWorkdaysInMonth(2024, 1);
console.log('2024年1月工作日:', workdaysJan2024);

// 获取2024年1月的非工作日
const nonWorkdaysJan2024 = getNonWorkdaysInMonth(2024, 1);
console.log('2024年1月非工作日:', nonWorkdaysJan2024);
```

### 节假日和补班日信息

```typescript
import { getHolidaysInYear, getMakeupDaysInYear } from '@life-toolkit/calendar';

// 获取2024年所有节假日
const holidays2024 = getHolidaysInYear(2024);
holidays2024.forEach(holiday => {
  console.log(`${holiday.Name}: ${holiday.StartDate} ~ ${holiday.EndDate}`);
  if (holiday.AsMakeUpDays.length > 0) {
    console.log(`补班日: ${holiday.AsMakeUpDays.join(', ')}`);
  }
});

// 获取2024年所有补班日
const makeupDays2024 = getMakeupDaysInYear(2024);
console.log('2024年补班日:', makeupDays2024);
```

### 工作日计算

```typescript
import { 
  getNextWorkday, 
  getPreviousWorkday, 
  getWorkdaysBetween,
  getWorkdaysInRange 
} from '@life-toolkit/calendar';

// 获取下一个工作日
const nextWorkday = getNextWorkday('2024-01-01'); // 元旦后的第一个工作日
console.log('下一个工作日:', nextWorkday);

// 获取上一个工作日
const prevWorkday = getPreviousWorkday('2024-01-01'); // 元旦前的最后一个工作日
console.log('上一个工作日:', prevWorkday);

// 计算日期范围内的工作日天数
const workdayCount = getWorkdaysBetween('2024-01-01', '2024-01-31');
console.log('1月份工作日天数:', workdayCount);

// 获取日期范围内的所有工作日
const workdaysInRange = getWorkdaysInRange('2024-01-01', '2024-01-31');
console.log('1月份所有工作日:', workdaysInRange);
```

### 统计信息

```typescript
import { getYearStatistics, getMonthStatistics } from '@life-toolkit/calendar';

// 获取年度统计
const yearStats = getYearStatistics(2024);
console.log('2024年统计:', yearStats);
// {
//   year: 2024,
//   totalDays: 366,
//   workdays: 249,
//   weekends: 104,
//   holidays: 11,
//   makeupDays: 4,
//   actualWorkdays: 253
// }

// 获取月度统计
const monthStats = getMonthStatistics(2024, 1);
console.log('2024年1月统计:', monthStats);
// {
//   year: 2024,
//   month: 1,
//   totalDays: 31,
//   workdays: 22,
//   weekends: 8,
//   holidays: 1,
//   makeupDays: 0,
//   actualWorkdays: 22
// }
```

## 高级用法

### 使用类实例

```typescript
import { ChineseCalendar, DateType } from '@life-toolkit/calendar';

const calendar = new ChineseCalendar();

// 获取支持的年份
const supportedYears = calendar.getSupportedYears();
console.log('支持的年份:', supportedYears); // [2023, 2024, 2025]

// 获取详细日期信息
const dateInfo = calendar.getDateInfo('2024-02-04');
if (dateInfo.type === DateType.MAKEUP_DAY) {
  console.log('这是一个补班日');
}
```

### 错误处理

```typescript
import { getWorkdaysBetween } from '@life-toolkit/calendar';

try {
  // 开始日期晚于结束日期会抛出错误
  const count = getWorkdaysBetween('2024-01-31', '2024-01-01');
} catch (error) {
  console.error(error.message); // "开始日期不能晚于结束日期"
}
```

## 类型定义

```typescript
// 日期类型枚举
enum DateType {
  WORKDAY = 'workday',      // 工作日
  WEEKEND = 'weekend',      // 周末
  HOLIDAY = 'holiday',      // 节假日
  MAKEUP_DAY = 'makeup_day' // 补班日
}

// 日期信息
interface DateInfo {
  date: string;           // 日期字符串 (YYYY-MM-DD)
  type: DateType;         // 日期类型
  isWorkday: boolean;     // 是否为工作日
  holiday?: Holiday;      // 节假日信息 (如果是节假日)
  dayOfWeek: number;      // 星期几 (0-6, 0为周日)
}

// 节假日信息
interface Holiday {
  Name: string;           // 节假日名称
  StartDate: string;      // 开始日期
  EndDate: string;        // 结束日期
  Duration: number;       // 持续天数
  AsMakeUpDays: string[]; // 补班日期
}

// 年度统计信息
interface YearStatistics {
  year: number;           // 年份
  totalDays: number;      // 总天数
  workdays: number;       // 工作日天数
  weekends: number;       // 周末天数
  holidays: number;       // 节假日天数
  makeupDays: number;     // 补班日天数
  actualWorkdays: number; // 实际工作日天数
}

// 月度统计信息
interface MonthStatistics {
  year: number;           // 年份
  month: number;          // 月份 (1-12)
  totalDays: number;      // 总天数
  workdays: number;       // 工作日天数
  weekends: number;       // 周末天数
  holidays: number;       // 节假日天数
  makeupDays: number;     // 补班日天数
  actualWorkdays: number; // 实际工作日天数
}
```

## API 参考

### 便捷函数

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `isWorkday` | `date: Date \| string` | `boolean` | 判断是否为工作日 |
| `isHoliday` | `date: Date \| string` | `boolean` | 判断是否为节假日 |
| `isMakeupDay` | `date: Date \| string` | `boolean` | 判断是否为补班日 |
| `getDateInfo` | `date: Date \| string` | `DateInfo` | 获取日期详细信息 |
| `getWorkdaysInYear` | `year: number` | `string[]` | 获取年份所有工作日 |
| `getNonWorkdaysInYear` | `year: number` | `string[]` | 获取年份所有非工作日 |
| `getWorkdaysInMonth` | `year: number, month: number` | `string[]` | 获取月份所有工作日 |
| `getNonWorkdaysInMonth` | `year: number, month: number` | `string[]` | 获取月份所有非工作日 |
| `getHolidaysInYear` | `year: number` | `Holiday[]` | 获取年份所有节假日 |
| `getMakeupDaysInYear` | `year: number` | `string[]` | 获取年份所有补班日 |
| `getYearStatistics` | `year: number` | `YearStatistics` | 获取年度统计信息 |
| `getMonthStatistics` | `year: number, month: number` | `MonthStatistics` | 获取月度统计信息 |
| `getNextWorkday` | `date: Date \| string` | `string` | 获取下一个工作日 |
| `getPreviousWorkday` | `date: Date \| string` | `string` | 获取上一个工作日 |
| `getWorkdaysBetween` | `startDate: Date \| string, endDate: Date \| string` | `number` | 计算工作日天数 |
| `getWorkdaysInRange` | `startDate: Date \| string, endDate: Date \| string` | `string[]` | 获取范围内工作日 |
| `getSupportedYears` | - | `number[]` | 获取支持的年份 |

### ChineseCalendar 类

`ChineseCalendar` 类提供了与便捷函数相同的所有方法，可以创建多个实例来处理不同的需求。

## 数据来源

本工具库基于中国国务院办公厅发布的官方节假日安排，目前支持 2023-2025 年的数据。

## 许可证

MIT License 