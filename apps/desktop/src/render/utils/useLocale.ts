import { useContext } from 'react';
import { getRendererRuntimeOptional } from '@true-north/plugin-sdk';
import { GlobalContext } from '../context';
import defaultLocale from '../locale';

function useLocale(locale = null) {
  const { lang } = useContext(GlobalContext);
  const host = (locale || defaultLocale)[lang] || {};
  if (locale) return host;
  const pluginMessages = (getRendererRuntimeOptional()?.locales || []).map((item) => item.messages[lang] || {});
  return Object.assign({}, ...pluginMessages, host);
}

export default useLocale;
