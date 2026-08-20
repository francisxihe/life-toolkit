import {
  AppstoreOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  SettingOutlined,
} from '@sue/design-web-react';
import {
  DashboardOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  FolderKanban,
  Grid2X2,
  ListTodo,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import SiteIcon from '@/components/SiteIcon';
import styles from '../layout.module.less';

export function getIconFromKey(key: string): React.ReactNode {
  switch (key) {
    case '/growth':
      return <SiteIcon id="calendar-sidebar" className={styles.icon} />;
    case '/growth/workbench':
      return <Grid2X2 size={16} className={styles.icon} />;
    case '/growth/todo':
      return <ListTodo size={16} className={styles.icon} />;
    case '/growth/task':
      return <FolderKanban size={16} className={styles.icon} />;
    case '/growth/habit':
      return <TrendingUp size={16} className={styles.icon} />;
    case '/growth/goal':
      return <Target size={16} className={styles.icon} />;
    case '/ai':
      return <Sparkles size={16} className={styles.icon} />;
    case '/dashboard':
      return <DashboardOutlined className={styles.icon} />;
    case '/list':
      return <UnorderedListOutlined className={styles.icon} />;
    case '/form':
      return <SettingOutlined className={styles.icon} />;
    case '/profile':
      return <FileOutlined className={styles.icon} />;
    case '/visualization':
      return <AppstoreOutlined className={styles.icon} />;
    case '/result':
      return <CheckCircleOutlined className={styles.icon} />;
    case '/exception':
      return <ExclamationCircleOutlined className={styles.icon} />;
    case '/user':
      return <UserOutlined className={styles.icon} />;
    default:
      return <div className={styles['icon-empty']} />;
  }
}
