import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { groupBy } from 'lodash-es';
import { Popover, Badge, Tabs, Avatar, Spin, Button, CustomerServiceOutlined, DesktopOutlined, FileOutlined, MessageOutlined } from '@sue/design-web-react';

import useLocale from '../../utils/useLocale';
import MessageList, { MessageListType } from './list';
import styles from './style/index.module.less';

function DropContent() {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState<{
    [key: string]: MessageListType;
  }>({});
  const [sourceData, setSourceData] = useState<MessageListType>([]);

  function fetchSourceData(showLoading = true) {
    showLoading && setLoading(true);
    axios
      .get('/api/message/list')
      .then((res) => {
        setSourceData(res.data);
      })
      .finally(() => {
        showLoading && setLoading(false);
      });
  }

  function readMessage(data: MessageListType) {
    const ids = data.map((item) => item.id);
    axios
      .post('/api/message/read', {
        ids,
      })
      .then(() => {
        fetchSourceData();
      });
  }

  useEffect(() => {
    fetchSourceData();
  }, []);

  useEffect(() => {
    const nextGroupData: { [key: string]: MessageListType } = groupBy(
      sourceData,
      'type',
    );
    setGroupData(nextGroupData);
  }, [sourceData]);

  const tabList = [
    {
      key: 'message',
      title: t['message.tab.title.message'],
      titleIcon: <MessageOutlined />,
    },
    {
      key: 'notice',
      title: t['message.tab.title.notice'],
      titleIcon: <CustomerServiceOutlined />,
    },
    {
      key: 'todo',
      title: t['message.tab.title.todo'],
      titleIcon: <FileOutlined />,
      avatar: (
        <Avatar style={{ backgroundColor: '#0FC6C2' }}>
          <DesktopOutlined />
        </Avatar>
      ),
    },
  ];

  const items = useMemo(
    () =>
      tabList.map((item) => {
        const { key, title } = item;
        const data = groupData[key] || [];
        const unReadData = data.filter((entry) => !entry.status);
        return {
          key,
          label: (
            <span>
              {title}
              {unReadData.length ? `(${unReadData.length})` : ''}
            </span>
          ),
          children: (
            <MessageList
              data={data}
              unReadData={unReadData}
              onItemClick={(entry) => {
                readMessage([entry]);
              }}
              onAllBtnClick={(unread) => {
                readMessage(unread);
              }}
            />
          ),
        };
      }),
    [groupData, t],
  );

  return (
    <div className={styles['message-box']}>
      <Spin spinning={loading} style={{ display: 'block' }}>
        <Tabs
          defaultActiveKey="message"
          destroyOnHidden
          tabBarExtraContent={
            <Button type="link" onClick={() => setSourceData([])}>
              {t['message.empty']}
            </Button>
          }
          items={items}
        />
      </Spin>
    </div>
  );
}

function MessageBox({ children }) {
  return (
    <Popover
      trigger="hover"
      content={<DropContent />}
      placement="bottomRight"
      destroyOnHidden={false}
    >
      <Badge count={9} dot>
        {children}
      </Badge>
    </Popover>
  );
}

export default MessageBox;
