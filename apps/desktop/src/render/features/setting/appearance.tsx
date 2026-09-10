import { useContext } from 'react';
import { Flex, Radio } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { GlobalContext } from '@/context';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style.module.less';

function Appearance() {
  const t = useLocale(locale);
  const { lang, setLang, themePreference, setThemePreference } = useContext(GlobalContext);

  return (
    <ProductSurface id={productRef('setting.view.appearance')}>
      <Flex vertical className={styles.content} gap={24}>
        <h1 className={styles.title}>{t['setting.appearance']}</h1>
        <Flex vertical className={styles.group}>
          <Flex className={styles.row} align="center" justify="space-between" gap={16}>
            <div className={styles.rowLabel}>{t['setting.appearance.language']}</div>
            <Radio.Group
              optionType="button"
              value={lang}
              onChange={(event) => {
                const value = event.target.value;
                if (value) {
                  setLang?.(value);
                }
              }}
            >
              <Radio value="zh-CN">{t['setting.appearance.language.zh']}</Radio>
              <Radio value="en-US">{t['setting.appearance.language.en']}</Radio>
            </Radio.Group>
          </Flex>
          <Flex className={styles.row} align="center" justify="space-between" gap={16}>
            <div className={styles.rowLabel}>{t['setting.appearance.theme']}</div>
            <Radio.Group
              optionType="button"
              value={themePreference ?? 'system'}
              onChange={(event) => {
                const value = event.target.value;
                if (value === 'system' || value === 'light' || value === 'dark') {
                  setThemePreference?.(value);
                }
              }}
            >
              <Radio value="system">{t['setting.appearance.theme.system']}</Radio>
              <Radio value="light">{t['setting.appearance.theme.light']}</Radio>
              <Radio value="dark">{t['setting.appearance.theme.dark']}</Radio>
            </Radio.Group>
          </Flex>
        </Flex>
      </Flex>
    </ProductSurface>
  );
}

export default Appearance;
