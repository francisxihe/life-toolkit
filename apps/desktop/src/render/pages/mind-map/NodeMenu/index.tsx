import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Flex, CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@sue/design-web-react';

import styles from './style.module.less';

interface NodeMenuProps {
  nodeId: string;
  nodeType: string;
  position: { x: number; y: number };
  visible: boolean;
  onClose: () => void;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onAddChild?: (nodeId: string) => void;
  onAddSibling?: (nodeId: string) => void;
  onCopy?: (nodeId: string) => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({
  nodeId,
  nodeType,
  position,
  visible,
  onClose,
  onEdit,
  onDelete,
  onAddChild,
  onAddSibling,
  onCopy,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  // ESC 键关闭菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined style={{ fontSize: 16 }} />,
      label: '编辑目标',
      onClick: () => {
        onEdit?.(nodeId);
        onClose();
      },
    },
    {
      key: 'addChild',
      icon: <PlusOutlined style={{ fontSize: 16 }} />,
      label: '添加子目标',
      onClick: () => {
        onAddChild?.(nodeId);
        onClose();
      },
    },
    {
      key: 'addSibling',
      icon: <PlusOutlined style={{ fontSize: 16 }} />,
      label: '添加同级目标',
      onClick: () => {
        onAddSibling?.(nodeId);
        onClose();
      },
    },
    {
      key: 'copy',
      icon: <CopyOutlined style={{ fontSize: 16 }} />,
      label: '复制目标',
      onClick: () => {
        onCopy?.(nodeId);
        onClose();
      },
    },
    {
      key: 'delete',
      icon: <DeleteOutlined style={{ fontSize: 16 }} />,
      label: '删除节点',
      className: styles['menu-item-danger'],
      onClick: () => {
        onDelete?.(nodeId);
        onClose();
      },
    },
  ];

  // 创建 Portal 容器
  const portalContainer = document.body;

  return createPortal(
    <div
      ref={menuRef}
      className={styles['node-menu']}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <Menu>
        {menuItems.map((item) => {
          return (
            <Menu.Item
              key={item.key}
              className={item.className}
              onClick={item.onClick}
            >
              <Flex className={styles['menu-item']} align="center" gap={8}>
                {item.icon}
                <span>{item.label}</span>
              </Flex>
            </Menu.Item>
          );
        })}
      </Menu>
    </div>,
    portalContainer,
  );
};

export default NodeMenu;
