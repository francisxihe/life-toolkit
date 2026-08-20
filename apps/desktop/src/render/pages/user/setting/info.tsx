import React, { useContext } from 'react';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import { GlobalContext } from '@/context';
import { Input, Select, Cascader, Button, Form, Space, message, Skeleton } from '@sue/design-web-react';

function InfoForm({ loading }: { loading?: boolean }) {
  const t = useLocale(locale);
  const [form] = Form.useForm();
  const { lang } = useContext(GlobalContext);

  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success('userSetting.saveSuccess');
    } catch (_) {}
  };

  const handleReset = () => {
    form.resetFields();
  };

  const loadingNode = (rows = 1) => {
    return (
      <Skeleton
        text={{
          rows,
          width: new Array(rows).fill('100%'),
        }}
        animation
      />
    );
  };

  return (
    <Form
      style={{ width: '500px', marginTop: '6px' }}
      form={form}
      labelCol={{ span: lang === 'en-US' ? 7 : 6 }}
      wrapperCol={{ span: lang === 'en-US' ? 17 : 18 }}
    >
      <Form.Item
        label={t['userSetting.info.email']}
        name="email"
        rules={[
          {
            type: 'email',
            required: true,
            message: t['userSetting.info.email.placeholder'],
          },
        ]}
      >
        {loading ? (
          loadingNode()
        ) : (
          <Input placeholder={t['userSetting.info.email.placeholder']} />
        )}
      </Form.Item>
      <Form.Item
        label={t['userSetting.info.nickName']}
        name="nickName"
        rules={[
          {
            required: true,
            message: t['userSetting.info.nickName.placeholder'],
          },
        ]}
      >
        {loading ? (
          loadingNode()
        ) : (
          <Input placeholder={t['userSetting.info.nickName.placeholder']} />
        )}
      </Form.Item>
      <Form.Item
        label={t['userSetting.info.area']}
        name="rangeArea"
        rules={[
          { required: true, message: t['userSetting.info.area.placeholder'] },
        ]}
      >
        {loading ? (
          loadingNode()
        ) : (
          <Select
            options={['中国']}
            placeholder={t['userSetting.info.area.placeholder']}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t['userSetting.info.location']}
        name="location"
        initialValue={['BeiJing', 'BeiJing', 'HaiDian']}
        rules={[
          {
            required: true,
          },
        ]}
      >
        {loading ? (
          loadingNode()
        ) : (
          <Cascader
            options={[
              {
                label: '北京市',
                value: 'BeiJing',
                children: [
                  {
                    label: '北京市',
                    value: 'BeiJing',
                    children: [
                      { label: '海淀区', value: 'HaiDian' },
                      { label: '朝阳区', value: 'ChaoYang' },
                    ],
                  },
                ],
              },
              {
                label: '上海市',
                value: 'ShangHai',
                children: [
                  {
                    label: '上海市',
                    value: 'ShangHai',
                    children: [
                      { label: '黄浦区', value: 'HuangPu' },
                      { label: '静安区', value: 'JingAn' },
                    ],
                  },
                ],
              },
            ]}
          />
        )}
      </Form.Item>
      <Form.Item label={t['userSetting.info.address']} name="address">
        {loading ? (
          loadingNode()
        ) : (
          <Input placeholder={t['userSetting.info.address.placeholder']} />
        )}
      </Form.Item>
      <Form.Item label={t['userSetting.info.profile']} name="profile">
        {loading ? (
          loadingNode(3)
        ) : (
          <Input.TextArea
            placeholder={t['userSetting.info.profile.placeholder']}
          />
        )}
      </Form.Item>

      <Form.Item label=" ">
        <Space>
          <Button type="primary" onClick={handleSave}>
            {t['userSetting.save']}
          </Button>
          <Button onClick={handleReset}>{t['userSetting.reset']}</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default InfoForm;
