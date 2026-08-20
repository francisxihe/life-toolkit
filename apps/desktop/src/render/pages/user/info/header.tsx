import { CameraOutlined, EnvironmentOutlined } from '@ant-design/icons';
import React from 'react';
import { Avatar, Space, Skeleton, HomeOutlined, UserOutlined, Flex } from '@sue/design-web-react';

import styles from './style/index.module.less';

interface HeaderProps {
  userInfo?: {
    name?: string;
    avatar?: string;
    jobName?: string;
    organizationName?: string;
    locationName?: string;
  };
  loading?: boolean;
}

function UserInfoHeader(props: HeaderProps) {
  const { userInfo = {}, loading } = props;

  const loadingNode = (
    <Skeleton
      text={{
        rows: 1,
        style: { width: '100px', height: '20px', marginBottom: '-4px' },
        width: ['100%'],
      }}
      animation
    />
  );
  const loadingImgNode = (
    <Skeleton
      text={{ rows: 0 }}
      image={{ style: { width: '64px', height: '64px' }, shape: 'circle' }}
      animation
    />
  );
  return (
    <Flex className={styles.header} justify="center" align="center">
      <Space
        size={8}
        direction="vertical"
        align="center"
        className={styles['header-content']}
      >
        {loading ? (
          loadingImgNode
        ) : (
          <Avatar size={64} triggerIcon={<CameraOutlined />}>
            <img src={userInfo.avatar} />
          </Avatar>
        )}
        <div className={styles.username}>
          {loading ? loadingNode : userInfo.name}
        </div>
        <div className={styles['user-msg']}>
          <Space size={18}>
            <div>
              <UserOutlined />
              <span className={styles['user-msg-text']}>
                {loading ? loadingNode : userInfo.jobName}
              </span>
            </div>
            <div>
              <HomeOutlined />
              <span className={styles['user-msg-text']}>
                {loading ? loadingNode : userInfo.organizationName}
              </span>
            </div>
            <div>
              <EnvironmentOutlined />
              <span className={styles['user-msg-text']}>
                {loading ? loadingNode : userInfo.locationName}
              </span>
            </div>
          </Space>
        </div>
      </Space>
    </Flex>
  );
}

export default UserInfoHeader;
