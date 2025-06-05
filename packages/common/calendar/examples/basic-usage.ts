/**
 * 中国日历工具库基本使用示例
 */

import { 
  isWorkday, 
  isHoliday, 
  isMakeupDay, 
  getDateInfo,
  getWorkdaysInYear,
  getWorkdaysInMonth,
  getHolidaysInYear,
  getMakeupDaysInYear,
  getYearStatistics,
  getMonthStatistics,
  getNextWorkday,
  getPreviousWorkday,
  getWorkdaysBetween,
  ChineseCalendar,
  DateType
} from '../dist/index';

console.log('=== 中国日历工具库使用示例 ===\n');

// 1. 基本日期判断
console.log('1. 基本日期判断:');
console.log(`2024-01-01 是工作日吗? ${isWorkday('2024-01-01')}`); // false (元旦)
console.log(`2024-01-02 是工作日吗? ${isWorkday('2024-01-02')}`); // true
console.log(`2024-01-01 是节假日吗? ${isHoliday('2024-01-01')}`); // true (元旦)
console.log(`2024-02-04 是补班日吗? ${isMakeupDay('2024-02-04')}`); // true (春节补班)
console.log();

// 2. 获取详细日期信息
console.log('2. 详细日期信息:');
const dateInfo = getDateInfo('2024-01-01');
console.log('2024-01-01 详细信息:', {
  date: dateInfo.date,
  type: dateInfo.type,
  isWorkday: dateInfo.isWorkday,
  holidayName: dateInfo.holiday?.Name,
  dayOfWeek: dateInfo.dayOfWeek
});
console.log();

// 3. 获取年度工作日
console.log('3. 年度工作日统计:');
const workdays2024 = getWorkdaysInYear(2024);
console.log(`2024年共有 ${workdays2024.length} 个工作日`);
console.log(`前5个工作日: ${workdays2024.slice(0, 5).join(', ')}`);
console.log();

// 4. 获取月度工作日
console.log('4. 月度工作日统计:');
const workdaysJan2024 = getWorkdaysInMonth(2024, 1);
console.log(`2024年1月共有 ${workdaysJan2024.length} 个工作日`);
console.log(`1月工作日: ${workdaysJan2024.join(', ')}`);
console.log();

// 5. 获取节假日信息
console.log('5. 节假日信息:');
const holidays2024 = getHolidaysInYear(2024);
console.log('2024年节假日:');
holidays2024.forEach(holiday => {
  console.log(`  ${holiday.Name}: ${holiday.StartDate} ~ ${holiday.EndDate} (${holiday.Duration}天)`);
  if (holiday.AsMakeUpDays.length > 0) {
    console.log(`    补班日: ${holiday.AsMakeUpDays.join(', ')}`);
  }
});
console.log();

// 6. 获取补班日
console.log('6. 补班日信息:');
const makeupDays2024 = getMakeupDaysInYear(2024);
console.log(`2024年补班日: ${makeupDays2024.join(', ')}`);
console.log();

// 7. 年度统计
console.log('7. 年度统计:');
const yearStats = getYearStatistics(2024);
console.log('2024年统计:', {
  总天数: yearStats.totalDays,
  工作日: yearStats.workdays,
  周末: yearStats.weekends,
  节假日: yearStats.holidays,
  补班日: yearStats.makeupDays,
  实际工作日: yearStats.actualWorkdays
});
console.log();

// 8. 月度统计
console.log('8. 月度统计:');
const monthStats = getMonthStatistics(2024, 1);
console.log('2024年1月统计:', {
  总天数: monthStats.totalDays,
  工作日: monthStats.workdays,
  周末: monthStats.weekends,
  节假日: monthStats.holidays,
  补班日: monthStats.makeupDays,
  实际工作日: monthStats.actualWorkdays
});
console.log();

// 9. 工作日计算
console.log('9. 工作日计算:');
const nextWorkday = getNextWorkday('2024-01-01');
const prevWorkday = getPreviousWorkday('2024-01-01');
const workdayCount = getWorkdaysBetween('2024-01-01', '2024-01-31');

console.log(`元旦后的第一个工作日: ${nextWorkday}`);
console.log(`元旦前的最后一个工作日: ${prevWorkday}`);
console.log(`2024年1月工作日天数: ${workdayCount}`);
console.log();

// 10. 使用类实例
console.log('10. 使用类实例:');
const calendar = new ChineseCalendar();
const supportedYears = calendar.getSupportedYears();
console.log(`支持的年份: ${supportedYears.join(', ')}`);

// 检查特殊日期
const specialDates = [
  '2024-02-04', // 春节补班日
  '2024-02-10', // 春节第一天
  '2024-05-01', // 劳动节
  '2024-10-01'  // 国庆节
];

console.log('\n特殊日期检查:');
specialDates.forEach(date => {
  const info = calendar.getDateInfo(date);
  let description = '';
  
  switch (info.type) {
    case DateType.WORKDAY:
      description = '工作日';
      break;
    case DateType.WEEKEND:
      description = '周末';
      break;
    case DateType.HOLIDAY:
      description = `节假日 (${info.holiday?.Name})`;
      break;
    case DateType.MAKEUP_DAY:
      description = '补班日';
      break;
  }
  
  console.log(`  ${date}: ${description}`);
});

console.log('\n=== 示例结束 ==='); 