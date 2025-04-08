import { RepeatProvider, RepeatContextProps } from "./context";
import { LocaleProvider } from "./useLocale";
import { RepeatSelectorMain } from "./RepeatMain";

export function RepeatSelector(props: {
  lang: "en-US" | "zh-CN";
  onChange: RepeatContextProps["onChange"];
}) {
  return (
    <LocaleProvider lang={props.lang}>
      <RepeatProvider onChange={props.onChange}>
        <RepeatSelectorMain />
      </RepeatProvider>
    </LocaleProvider>
  );
}
