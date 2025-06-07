import { Select } from "@arco-design/web-react";
import { useLocaleContext } from "../useLocale";
import { OrdinalDayType, OrdinalDay } from "../../types";

export const OrdinalDayTypeMap = new Map<OrdinalDayType, string>([
  [OrdinalDayType.DAY, "day"],
  [OrdinalDayType.WORKDAY, "workday"],
  [OrdinalDayType.REST_DAY, "restDay"],
]);

export const OrdinalMap = new Map<OrdinalDay, string>([
  [OrdinalDay.FIRST, "first"],
  [OrdinalDay.SECOND, "second"],
  [OrdinalDay.THIRD, "third"],
  [OrdinalDay.FOURTH, "fourth"],
  [OrdinalDay.FIFTH, "fifth"],
  [OrdinalDay.SECOND_LAST, "secondLast"],
  [OrdinalDay.LAST, "last"],
]);

export default function OrdinalDaySelector({
  ordinal,
  setOrdinal,
  ordinalDayType,
  setOrdinalDayType,
}: {
  ordinal: OrdinalDay;
  setOrdinal: (value: OrdinalDay) => void;
  ordinalDayType: OrdinalDayType;
  setOrdinalDayType: (value: OrdinalDayType) => void;
}) {
  const { t } = useLocaleContext();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={ordinal}
        options={Array.from(OrdinalMap.entries()).map(([key, value]) => {
          return {
            value: key,
            label: t[value],
          };
        })}
        onChange={(value) => {
          setOrdinal(value);
        }}
      />
      <Select
        value={ordinalDayType}
        options={Array.from(OrdinalDayTypeMap.entries()).map(
          ([key, value]) => ({
            value: key,
            label: t[value],
          })
        )}
        onChange={(value) => {
          setOrdinalDayType(value);
        }}
      />
    </div>
  );
}
