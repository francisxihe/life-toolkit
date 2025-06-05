import { Holiday } from "../types";
import calendar2025 from "./2025";
import calendar2024 from "./2024";
import calendar2023 from "./2023";

/**
 * 日历数据库结构
 */
export interface CalendarDatabase {
  Name: string;
  Version: string;
  Timezone: string;
  Years: Record<string, Holiday[]>;
}

/**
 * 中国节假日补班日历数据
 * 基于国务院办公厅发布的官方节假日安排
 */
export const calendarDatabase: CalendarDatabase = {
  Name: "中国节假日补班日历",
  Version: "2025.1.0",
  Timezone: "Asia/Shanghai",
  Years: {
    "2025": calendar2025,
    "2024": calendar2024,
    "2023": calendar2023,
  },
};
