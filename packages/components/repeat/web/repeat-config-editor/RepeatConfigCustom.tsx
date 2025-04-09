import { Select, InputNumber } from "@arco-design/web-react";
import { RepeatFormCustom, TimeUnit } from "../../types";
import RepeatConfigMonthly from "./RepeatConfigMonthly";
import RepeatConfigYearly from "./RepeatConfigYearly";
import RepeatConfigWeekly from "./RepeatConfigWeekly";

export default function RepeatConfigCustom(props: {
  config: RepeatFormCustom["config"];
  handleConfigChange: (config: RepeatFormCustom["config"]) => void;
}) {
  const { config: customConfig, handleConfigChange } = props;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>每</span>
        <InputNumber
          min={1}
          value={customConfig.interval}
          onChange={(value) =>
            handleConfigChange({ ...customConfig, interval: value })
          }
          className="rounded-md w-20"
        />
        <Select
          value={customConfig.intervalUnit}
          onChange={(value) =>
            handleConfigChange({ ...customConfig, intervalUnit: value })
          }
          className="rounded-md w-20"
          options={[
            { value: "day", label: "天" },
            { value: "week", label: "周" },
            { value: "month", label: "月" },
            { value: "year", label: "年" },
          ]}
        />
      </div>

      {customConfig.intervalUnit === "week" && (
        <RepeatConfigWeekly
          config={customConfig[TimeUnit.WEEK]}
          handleConfigChange={(config) => {
            handleConfigChange({
              ...customConfig,
              [TimeUnit.WEEK]: {
                weekdays: config.weekdays,
              },
            });
          }}
        />
      )}

      {customConfig.intervalUnit === "month" && (
        <RepeatConfigMonthly
          config={customConfig[TimeUnit.MONTH]}
          handleConfigChange={(config) => {
            handleConfigChange({
              ...customConfig,
              [TimeUnit.MONTH]: config,
            });
          }}
        />
      )}

      {customConfig.intervalUnit === "year" && (
        <RepeatConfigYearly
          config={customConfig[TimeUnit.YEAR]}
          handleConfigChange={(config) =>
            handleConfigChange({
              ...customConfig,
              [TimeUnit.YEAR]: config,
            })
          }
        />
      )}
    </div>
  );
}
