import { Select } from "@arco-design/web-react";
import RepeatEndModeForm from "./RepeatEndMode";
import { RepeatMode } from "../../types";
import { useRepeatContext } from "./context";
import {
  RepeatConfigCustom,
  RepeatConfigMonthly,
  RepeatConfigWeekly,
  RepeatConfigYearly,
} from "./repeat-config-editor";

export const RepeatModeMap = new Map<RepeatMode, string>([
  [RepeatMode.NONE, "repeat.mode.none"],
  [RepeatMode.DAILY, "repeat.mode.daily"],
  [RepeatMode.WEEKLY, "repeat.mode.weekly"],
  [RepeatMode.WEEKDAYS, "repeat.mode.weekdays"],
  [RepeatMode.WEEKEND, "repeat.mode.weekend"],
  [RepeatMode.MONTHLY, "repeat.mode.monthly"],
  [RepeatMode.WORKDAYS, "repeat.mode.workdays"],
  [RepeatMode.REST_DAY, "repeat.mode.restDay"],
  [RepeatMode.YEARLY, "repeat.mode.yearly"],
  [RepeatMode.CUSTOM, "repeat.mode.custom"],
]);

export function RepeatSelectorMain() {
  const {
    repeatModeForm,
    handleChangeRepeatMode,
    handleChangeRepeatConfig,
    t,
  } = useRepeatContext();

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={repeatModeForm.repeatMode}
        placeholder="选择重复模式"
        className="rounded-md w-full"
        allowClear
        onChange={handleChangeRepeatMode}
        options={Array.from(RepeatModeMap.entries()).map(([key, value]) => ({
          value: key,
          label: t[value],
        }))}
      />

      {repeatModeForm.repeatMode === RepeatMode.WEEKLY && (
        <RepeatConfigWeekly
          repeatConfig={repeatModeForm.repeatConfig}
          handleConfigChange={handleChangeRepeatConfig}
        />
      )}

      {repeatModeForm.repeatMode === RepeatMode.MONTHLY && (
        <RepeatConfigMonthly
          repeatConfig={repeatModeForm.repeatConfig}
          handleConfigChange={handleChangeRepeatConfig}
        />
      )}

      {repeatModeForm.repeatMode === RepeatMode.YEARLY && (
        <RepeatConfigYearly
          repeatConfig={repeatModeForm.repeatConfig}
          handleConfigChange={handleChangeRepeatConfig}
        />
      )}

      {repeatModeForm.repeatMode === RepeatMode.CUSTOM && (
        <RepeatConfigCustom
          repeatConfig={repeatModeForm.repeatConfig}
          handleConfigChange={handleChangeRepeatConfig}
        />
      )}

      {repeatModeForm.repeatMode === RepeatMode.NONE || <RepeatEndModeForm />}
    </div>
  );
}
