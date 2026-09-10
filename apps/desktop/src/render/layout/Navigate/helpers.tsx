import {
  Calendar,
  CircleAlert,
  CircleCheck,
  File,
  FolderKanban,
  Grid2X2,
  LayoutDashboard,
  LayoutGrid,
  List,
  ListTodo,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import styles from '../layout.module.less';

export function getIconFromKey(key: string): React.ReactNode {
  switch (key) {
    case '/growth':
      return <Calendar size={16} className={styles.icon} />;
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
      return <LayoutDashboard size={16} className={styles.icon} />;
    case '/list':
      return <List size={16} className={styles.icon} />;
    case '/form':
      return <Settings size={16} className={styles.icon} />;
    case '/profile':
      return <File size={16} className={styles.icon} />;
    case '/visualization':
      return <LayoutGrid size={16} className={styles.icon} />;
    case '/result':
      return <CircleCheck size={16} className={styles.icon} />;
    case '/exception':
      return <CircleAlert size={16} className={styles.icon} />;
    case '/user':
      return <User size={16} className={styles.icon} />;
    default:
      return <div className={styles['icon-empty']} />;
  }
}
