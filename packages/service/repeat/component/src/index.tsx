import { RepeatProvider, RepeatContextProps } from './context';
import { LocaleProvider } from './useLocale';
import { RepeatSelectorMain } from './RepeatMain';
import { RepeatModeForm, RepeatEndModeForm } from '@life-toolkit/service-repeat-types';
import './style.css';

export function RepeatSelector(props: {
  lang: 'en-US' | 'zh-CN';
  value: RepeatModeForm & RepeatEndModeForm;
  onChange: (value: RepeatModeForm & RepeatEndModeForm) => void;
}) {
  const { lang } = props;

  const value = props.value ? props.value : undefined;

  return (
    <LocaleProvider lang={lang}>
      <RepeatProvider
        value={value}
        onChange={(_value) => {
          props.onChange(_value);
        }}
      >
        <RepeatSelectorMain />
      </RepeatProvider>
    </LocaleProvider>
  );
}
