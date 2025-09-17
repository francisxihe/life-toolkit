import defaultLocale from './locale';
import { createInjectState } from '@life-toolkit/common-web-utils';

export const [LocaleProvider, _useLocaleContext] = createInjectState<{
  PropsType: {
    lang: 'en-US' | 'zh-CN';
  };
  ContextType: {
    t: Record<string, string>;
  };
}>((props) => {
  return {
    t: defaultLocale[props.lang || 'zh-CN'],
  };
});

export const useLocaleContext = () => {
  const context = _useLocaleContext();
  if (!context) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
};
