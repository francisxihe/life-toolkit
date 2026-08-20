import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Skeleton, Tag, Space, Button, Badge } from '@sue/design-web-react';

import useLocale from '@/utils/useLocale';
import locale from './locale';
import axios from 'axios';
import styles from './style/index.module.less';

function Verified() {
  const t = useLocale(locale);
  const [data, setData] = useState({
    accountType: '',
    isVerified: true,
    verifiedTime: '',
    legalPersonName: '',
    certificateType: '',
    certificationNumber: '',
    enterpriseName: '',
    enterpriseCertificateType: '',
    organizationCode: ''
  });

  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const getData = async () => {
    const { data } = await axios.
    get('/api/user/verified/enterprise').
    finally(() => setLoading(false));
    setData(data);

    const { data: tableData } = await axios.
    get('/api/user/verified/authList').
    finally(() => setTableLoading(false));
    setTableData(tableData);
  };

  useEffect(() => {
    getData();
  }, []);

  const loadingNode = <Skeleton paragraph={{ rows: 1 }} />;

  return (
    <div className={styles.verified}>
      <h6 className="text-title-1 font-medium">
        {t['userSetting.verified.enterprise']}
      </h6>
      <Descriptions
        className={styles['verified-enterprise']}
        labelStyle={{ textAlign: 'right' }}
        layout="inline-horizontal"
        colon="："
        column={3}
        data={Object.entries(data).map(([key, value]) => ({
          label: t[`userSetting.verified.label.${key}`],
          value: loading ?
          loadingNode :
          typeof value === 'boolean' ?
          value ?
          <Tag color="green">{t['userSetting.value.verified']}</Tag> :

          <Tag color="red">{t['userSetting.value.notVerified']}</Tag> :

          value

        }))} />

      <h6 className="text-title-1 font-medium">
        {t['userSetting.verified.records']}
      </h6>
      <Table
        columns={[
        { title: t['userSetting.verified.authType'], dataIndex: 'authType' },
        {
          title: t['userSetting.verified.authContent'],
          dataIndex: 'authContent'
        },
        {
          title: t['userSetting.verified.authStatus'],
          dataIndex: 'authStatus',
          render(x) {
            return x ?
            <Badge
              status="success"
              paragraph={t['userSetting.verified.status.success']}>
            </Badge> :

            <span>
                  <Badge
                status="processing"
                paragraph={t['userSetting.verified.status.waiting']}>
              </Badge>
                </span>;

          }
        },
        {
          title: t['userSetting.verified.createdTime'],
          dataIndex: 'createdTime'
        },
        {
          title: t['userSetting.verified.operation'],
          headerCellStyle: { paddingLeft: '15px' },
          render: (_, x) => {
            if (x.authStatus) {
              return (
                <Button type="text">
                    {t['userSetting.verified.operation.view']}
                  </Button>);

            }
            return (
              <Space>
                  <Button type="text">
                    {t['userSetting.verified.operation.view']}
                  </Button>
                  <Button type="text">
                    {t['userSetting.verified.operation.revoke']}
                  </Button>
                </Space>);

          }
        }]
        }
        data={tableData}
        loading={tableLoading} />

    </div>);

}

export default Verified;