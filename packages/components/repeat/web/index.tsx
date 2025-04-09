import { RepeatProvider, RepeatContextProps } from "./context";
import { LocaleProvider } from "./useLocale";
import { RepeatSelectorMain } from "./RepeatMain";

export function RepeatSelector(props: {
  lang: "en-US" | "zh-CN";
  value: string;
  onChange: (value: string) => void;
}) {
  const { lang } = props;

  const value = props.value ? JSON.parse(props.value) : undefined;

  return (
    <LocaleProvider lang={lang}>
      <RepeatProvider
        value={value}
        onChange={(_value) => {
          props.onChange(JSON.stringify(_value));
        }}
      >
        <RepeatSelectorMain />
      </RepeatProvider>
    </LocaleProvider>
  );
}
