import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Skeleton, Row, Col, Empty, Flex, Card } from '@sue/design-web-react';

import useLocale from '@/utils/useLocale';
import locale from './locale';
import UserInfoHeader from './header';
import styles from './style/index.module.less';
import './mock';
import MyProject from './my-projects';
import MyTeam from './my-team';
import LatestNews from './latest-news';

function UserInfo() {
  const t = useLocale(locale);
  const userInfo = useSelector((state: any) => state.userInfo);
  const loading = useSelector((state: any) => state.userLoading);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const getNotice = async () => {
    setNoticeLoading(true);
    await axios.get('/api/user/notice').finally(() => setNoticeLoading(false));
  };
  useEffect(() => {
    getNotice();
  }, []);
  return (
    <div>
      <UserInfoHeader userInfo={userInfo} loading={loading} />
      <Row gutter={16}>
        <Col span={16}>
          <Card className={styles.wrapper}>
            <Flex justify="space-between">
              <h6 className="text-title-1 font-medium" style={{ marginBottom: '20px' }}>
                {t['userInfo.title.project']}
              </h6>
              <a style={{ color: "var(--color-primary-6)" }}>{t['userInfo.btn.more']}</a>
            </Flex>
            <MyProject />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.wrapper}>
            <Flex justify="space-between">
              <h6 className="text-title-1 font-medium" style={{ marginBottom: '12px' }}>
                {t['userInfo.title.team']}
              </h6>
            </Flex>
            <MyTeam />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={16}>
          <Card className={styles.wrapper}>
            <Flex justify="space-between">
              <h6 className="text-title-1 font-medium" style={{ marginBottom: '8px' }}>
                {t['userInfo.title.news']}
              </h6>
              <a style={{ color: "var(--color-primary-6)" }}>{t['userInfo.btn.all']}</a>
            </Flex>
            <LatestNews />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.wrapper}>
            <Flex justify="space-between">
              <h6 className="text-title-1 font-medium">{t['userInfo.title.notice']}</h6>
            </Flex>
            {noticeLoading ?
            <Skeleton paragraph={{ rows: 10 }} animation /> :

            <Flex
              vertical
              align="center"
              justify="center"
              gap={16}
              className="p-6 text-center"
              style={{ paddingTop: '60px', paddingBottom: '130px' }}>

                <Empty description={null} />
                <div className="text-title-1 font-medium">404</div>
                <div className="text-text-3">{t['userInfo.notice.empty']}</div>
              </Flex>
            }
          </Card>
        </Col>
      </Row>
    </div>);

}
export default UserInfo;