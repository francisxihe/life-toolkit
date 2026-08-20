import { CameraOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Avatar, Upload, Descriptions, Tag, Skeleton, PlusOutlined, Flex } from '@sue/design-web-react';

import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/header.module.less';
export default function Info({
  userInfo = {},
  loading

}: {userInfo: any;loading: boolean;}) {
  const t = useLocale(locale);
  const [avatar, setAvatar] = useState('');
  function onAvatarChange(_, file) {
    setAvatar(file.originFile ? URL.createObjectURL(file.originFile) : '');
  }
  useEffect(() => {
    setAvatar(userInfo.avatar);
  }, [userInfo]);
  const loadingImg =
  <Skeleton
    paragraph={{ rows: 0 }}
    style={{ width: '100px', height: '100px' }}
    animation />;

  const loadingNode = <Skeleton paragraph={{ rows: 1 }} animation />;
  return (
    <Flex>
      <Upload showUploadList={false} onChange={onAvatarChange}>
        {loading ?
        loadingImg :

        <Avatar
          size={100}
          triggerIcon={<CameraOutlined />}
          className={styles['info-avatar']}>

            {avatar ? <img src={avatar} /> : <PlusOutlined />}
          </Avatar>
        }
      </Upload>
      <Descriptions
        className={styles['info-content']}
        column={2}
        colon="："
        labelStyle={{ textAlign: 'right' }}
        data={[
        {
          label: t['userSetting.label.name'],
          value: loading ? loadingNode : userInfo.name
        },
        {
          label: t['userSetting.label.verified'],
          value: loading ?
          loadingNode :

          <span>
                {userInfo.verified ?
            <Tag color="green" className={styles['verified-tag']}>
                    {t['userSetting.value.verified']}
                  </Tag> :

            <Tag color="red" className={styles['verified-tag']}>
                    {t['userSetting.value.notVerified']}
                  </Tag>
            }
                <a role="button" className={styles['edit-btn']} style={{ color: "var(--color-primary-6)" }}>
                  {t['userSetting.btn.edit']}
                </a>
              </span>

        },
        {
          label: t['userSetting.label.accountId'],
          value: loading ? loadingNode : userInfo.accountId
        },
        {
          label: t['userSetting.label.phoneNumber'],
          value: loading ?
          loadingNode :

          <span>
                {userInfo.phoneNumber}
                <a role="button" className={styles['edit-btn']} style={{ color: "var(--color-primary-6)" }}>
                  {t['userSetting.btn.edit']}
                </a>
              </span>

        },
        {
          label: t['userSetting.label.registrationTime'],
          value: loading ? loadingNode : userInfo.registrationTime
        }]
        }>
      </Descriptions>
    </Flex>);

}