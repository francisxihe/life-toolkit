import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Card,
  Switch,
  Empty,
  Flex } from
'@sue/design-web-react';

import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/index.module.less';

function StepForm() {
  const t = useLocale(locale);
  const [current, setCurrent] = useState(1);

  const [form] = Form.useForm();

  const viewForm = () => {
    const values = form.getFieldsValue();
    form.setFieldsValue(values);
    setCurrent(1);
  };

  const reCreateForm = () => {
    form.resetFields();
    setCurrent(1);
  };

  const toNext = async () => {
    try {
      await form.validateFields();
      setCurrent(current + 1);
    } catch (_) {}
  };

  const steps = [
  {
    title: t['stepForm.title.basicInfo'],
    description: t['stepForm.desc.basicInfo']
  },
  {
    title: t['stepForm.title.channel'],
    description: t['stepForm.desc.channel']
  },
  {
    title: t['stepForm.title.created'],
    description: t['stepForm.desc.created']
  }];

  return (
    <div className={styles.container}>
      <Card>
        <h5 className="text-title-1 font-medium">{t['stepForm.desc.basicInfo']}</h5>
        <div className={styles.wrapper}>
          <Flex gap={8} wrap="wrap">
            {steps.map((step, index) => {
              const active = index === current;
              const done = index < current;
              return (
                <Flex key={index} vertical gap={4} style={{ minWidth: 120 }}>
                  <Flex align="center" gap={8}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        background: active ?
                        'var(--color-primary-6, #165dff)' :
                        done ?
                        'var(--color-primary-3, #94bfff)' :
                        'var(--color-fill-3, #f2f3f5)',
                        color:
                        active || done ? '#fff' : 'var(--color-text-2)'
                      }}>

                      {index + 1}
                    </span>
                    <span style={{ fontWeight: active ? 600 : 400 }}>
                      {step.title}
                    </span>
                  </Flex>
                  {step.description &&
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-3)',
                      paddingLeft: 32
                    }}>

                      {step.description}
                    </span>
                  }
                </Flex>);

            })}
          </Flex>
          <Form form={form} className={styles.form}>
            {current === 1 &&
            <Form.Item noStyle>
                <Form.Item
                label={t['stepForm.basicInfo.name']}
                required
                name="basic.name"
                rules={[
                {
                  required: true,
                  message: t['stepForm.basicInfo.name.required']
                },
                {
                  validator: (value: string, callback) => {
                    if (!/^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/g.test(value)) {
                      callback(t['stepForm.basicInfo.name.placeholder']);
                    }
                  }
                }]
                }>

                  <Input
                  placeholder={t['stepForm.basicInfo.name.placeholder']} />

                </Form.Item>
                <Form.Item
                label={t['stepForm.basicInfo.channelType']}
                required
                initialValue="app"
                name="basic.channelType"
                rules={[
                {
                  required: true,
                  message: t['stepForm.basicInfo.channelType.required']
                }]
                }>

                  <Select>
                    <Select.Option value="app">APP通用渠道</Select.Option>
                    <Select.Option value="site">网页通用渠道</Select.Option>
                    <Select.Option value="game">游戏通用渠道</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                label={t['stepForm.basicInfo.time']}
                required
                name="basic.time"
                rules={[
                {
                  required: true,
                  message: t['stepForm.basicInfo.time.required']
                }]
                }>

                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                label={t['stepForm.basicInfo.link']}
                required
                extra={t['stepForm.basicInfo.link.tips']}
                name="basic.link"
                initialValue={'https://arco.design'}
                rules={[{ required: true }]}>

                  <Input
                  placeholder={t['stepForm.basicInfo.link.placeholder']} />

                </Form.Item>
              </Form.Item>
            }
            {current === 2 &&
            <Form.Item noStyle>
                <Form.Item
                label={t['stepForm.channel.source']}
                required
                name="channel.source"
                rules={[
                {
                  required: true,
                  message: t['stepForm.channel.source.required']
                }]
                }>

                  <Input
                  placeholder={t['stepForm.channel.source.placeholder']} />

                </Form.Item>
                <Form.Item
                label={t['stepForm.channel.media']}
                required
                name="channel.media"
                rules={[
                {
                  required: true,
                  message: t['stepForm.channel.media.required']
                }]
                }>

                  <Input
                  placeholder={t['stepForm.channel.media.placeholder']} />

                </Form.Item>
                <Form.Item
                label={t['stepForm.channel.keywords']}
                required
                name="channel.keywords"
                initialValue={['今日头条', '火山']}
                rules={[{ required: true }]}>

                  <Select mode="tags" />
                </Form.Item>
                <Form.Item
                label={t['stepForm.channel.remind']}
                required
                initialValue={true}
                name="channel.remind"
                triggerPropName="checked"
                rules={[{ required: true }]}>

                  <Switch />
                </Form.Item>

                <Form.Item
                label={t['stepForm.channel.content']}
                required
                name="channel.content"
                rules={[
                {
                  required: true,
                  message: t['stepForm.channel.content.required']
                }]
                }>

                  <Input.TextArea
                  placeholder={t['stepForm.channel.content.placeholder']} />

                </Form.Item>
              </Form.Item>
            }
            {current !== 3 ?
            <Form.Item label=" ">
                <Space>
                  {current === 2 &&
                <Button
                  size="large"
                  onClick={() => setCurrent(current - 1)}>

                      {t['stepForm.prev']}
                    </Button>
                }
                  {current !== 3 &&
                <Button type="primary" size="large" onClick={toNext}>
                      {t['stepForm.next']}
                    </Button>
                }
                </Space>
              </Form.Item> :

            <Form.Item noStyle>
                <Flex
                vertical
                align="center"
                justify="center"
                gap={16}
                className="p-6 text-center">

                  <Empty description={null} />
                  <div className="text-title-1 font-medium">
                    {t['stepForm.created.success.title']}
                  </div>
                  <div className="text-text-3">
                    {t['stepForm.created.success.desc']}
                  </div>
                  <div>
                    <Button
                    key="reset"
                    style={{ marginRight: 16 }}
                    onClick={viewForm}>

                      {t['stepForm.created.success.view']}
                    </Button>
                    <Button key="again" type="primary" onClick={reCreateForm}>
                      {t['stepForm.created.success.again']}
                    </Button>
                  </div>
                </Flex>
              </Form.Item>
            }
          </Form>
        </div>
        {current === 3 &&
        <div className={styles['form-extra']}>
            <h6 className="text-title-1 font-medium">{t['stepForm.created.extra.title']}</h6>
            <p className="text-text-3">
              {t['stepForm.created.extra.desc']}
              <Button type="text">{t['stepForm.created.extra.detail']}</Button>
            </p>
          </div>
        }
      </Card>
    </div>);

}

export default StepForm;