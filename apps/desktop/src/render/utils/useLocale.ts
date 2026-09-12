import { useContext } from 'react';
import { useRendererPlatformOptional } from '@true-north/plugin-sdk/renderer';
import { GlobalContext } from '../context';
import defaultLocale from '../locale';

function useLocale(locale = null) {
  const { lang } = useContext(GlobalContext);
  const platform = useRendererPlatformOptional();
  const host = (locale || defaultLocale)[lang] || {};
  if (locale) return host;
  const pluginMessages = (platform?.locales || []).map((item) => item.messages[lang] || {});
  return Object.assign({}, ...pluginMessages, host);
}

export default useLocale;
