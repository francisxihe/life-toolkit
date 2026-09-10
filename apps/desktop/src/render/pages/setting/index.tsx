import DefaultPage from '@/components/Layout/DefaultPage';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import Appearance from './appearance';

function SettingPage() {
  const t = useLocale(locale);

  return (
    <DefaultPage title={t['menu.setting']}>
      <Appearance />
    </DefaultPage>
  );
}

export default SettingPage;
