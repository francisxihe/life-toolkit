import { Drawer, message, Modal } from '@sue/design-web-react';
import GoalEditor from '@/pages/growth/components/GoalDetail/GoalEditor';
import GoalCreator from '@/pages/growth/components/GoalDetail/GoalCreator';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import { GoalService } from '@true-north/web-service';

export const handleAddChild = (nodeId: string) => {
  return new Promise((resolve) => {
    const instance = Drawer.open({
      title: '新增子目标',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <GoalCreator
          initialFormData={{
            parentId: nodeId, // 设置父级目标为当前节点
          }}
          onClose={async () => {
            instance.destroy();
          }}
          afterSubmit={async () => {
            resolve(true);
          }}
        />
      ),
    });
  });
};

export const handleAddSibling = async (nodeId: string) => {
  return new Promise(async (resolve) => {
    try {
      // 获取当前节点信息，以获取其父级ID
      const currentGoal = await GoalService.find(nodeId);
      const parentId = currentGoal.parentId;

      const instance = Drawer.open({
        title: '新增同级目标',
        size: 800,
        styles: drawerPaddedBodyStyles,
        content: (
          <GoalCreator
            initialFormData={{
              parentId: parentId, // 设置父级目标为当前节点的父级
            }}
            onClose={async () => {
              instance.destroy();
            }}
            afterSubmit={async () => {
              resolve(true);
            }}
          />
        ),
      });
    } catch (error) {
      console.error('获取目标信息失败:', error);
      message.error('获取目标信息失败');
      resolve(false);
    }
  });
};

export const handleCopyNode = async (nodeId: string) => {
  return new Promise(async (resolve) => {
    try {
      // 获取当前节点信息
      const currentGoal = await GoalService.find(nodeId);

      const instance = Drawer.open({
        title: '复制目标',
        size: 800,
        styles: drawerPaddedBodyStyles,
        content: (
          <GoalCreator
            initialFormData={{
              name: `${currentGoal.name} - 副本`,
              description: currentGoal.description,
              type: currentGoal.type,
              importance: currentGoal.importance,
              difficulty: currentGoal.difficulty,
              parentId: currentGoal.parentId, // 保持相同的父级
              planTimeRange: [undefined, undefined], // 重置时间范围
            }}
            onClose={async () => {
              instance.destroy();
            }}
            afterSubmit={async () => {
              resolve(true);
            }}
          />
        ),
      });
    } catch (error) {
      console.error('获取目标信息失败:', error);
      message.error('获取目标信息失败');
      resolve(false);
    }
  });
};

export const handleDeleteNode = (nodeId: string) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确定删除吗？',
      content: '删除后将无法恢复,如果目标下有子目标,将一并删除,是否继续?',
      onOk: async () => {
        await GoalService.delete(nodeId);
        resolve(true);
      },
    });
  });
};

export const handleEditNode = (nodeId: string) => {
  return new Promise((resolve) => {
    const instance = Drawer.open({
      title: '编辑目标',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <GoalEditor
          goalId={nodeId}
          onClose={async () => {
            instance.destroy();
          }}
          afterSubmit={async () => {
            resolve(true);
          }}
        />
      ),
    });
  });
};
