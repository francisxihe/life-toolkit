import { Tabs } from '@sue/design-web-react';
import { useLocation, useNavigate } from 'react-router-dom';

const goalPagePath = '/goals';
const goalMindMapPath = '/goals/mindmap';

export function GoalManagementHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = location.pathname === goalMindMapPath ? 'mindmap' : 'tree';

  return (
    <Tabs
      activeKey={activeKey}
      items={[
        { key: 'tree', label: '目标树' },
        { key: 'mindmap', label: '目标脑图' },
      ]}
      onChange={(key) => navigate(key === 'mindmap' ? goalMindMapPath : goalPagePath)}
    />
  );
}
