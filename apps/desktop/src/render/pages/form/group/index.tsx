import React, { useState, useRef } from 'react';
import { Card, Form, Select, Input, Space, Button, message, Row, Col, Flex } from '@sue/design-web-react';

import { FormInstance } from '@sue/design-web-react';
import axios from 'axios';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/index.module.less';
import './mock';

function GroupForm() {
  const t = useLocale(locale);
  const formRef = useRef<FormInstance>();
  const [loading, setLoading] = useState(false);

  function submit(data) {
    setLoading(true);
    axios.
    post('/api/groupForm', {
      data
    }).
    then(() => {
      message.success(t['groupForm.submitSuccess']);
    }).
    finally(() => {
      setLoading(false);
    });
  }

  function handleSubmit() {
    formRef.current.validateFields().then((values) => {
      submit(values);
    });
  }

  function handleReset() {
    formRef.current.resetFields();
  }

  return (
    <div className={styles.container}>
      <Form layout="vertical" ref={formRef} className={styles['form-group']}>
        <Card>
          <h6 className="text-title-1 font-medium">
            {t['groupForm.title.video']}
          </h6>
          <Row gutter={80}>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.mode']}
                name="video.mode"
                initialValue={'custom'}>

                <Select placeholder={t['groupForm.placeholder.video.mode']}>
                  <Select.Option value="custom">自定义</Select.Option>
                  <Select.Option value="mode1">模式1</Select.Option>
                  <Select.Option value="mode2">模式2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.acquisition.resolution']}
                name="video.acquisition.resolution">

                <Select
                  placeholder={
                  t['groupForm.placeholder.video.acquisition.resolution']
                  }>

                  <Select.Option value="resolution1">分辨率1</Select.Option>
                  <Select.Option value="resolution2">分辨率2</Select.Option>
                  <Select.Option value="resolution3">分辨率3</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.acquisition.frameRate']}
                name="video.acquisition.frameRate">

                <Input
                  placeholder={
                  t['groupForm.placeholder.video.acquisition.frameRate']
                  }
                  addonAfter="fps" />

              </Form.Item>
            </Col>
          </Row>
          <Row gutter={80}>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.encoding.resolution']}
                name="video.encoding.resolution">

                <Select
                  placeholder={
                  t['groupForm.placeholder.video.encoding.resolution']
                  }>

                  <Select.Option value="resolution1">分辨率1</Select.Option>
                  <Select.Option value="resolution2">分辨率2</Select.Option>
                  <Select.Option value="resolution3">分辨率3</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.encoding.rate.min']}
                name="video.encoding.rate.min">

                <Input
                  placeholder={
                  t['groupForm.placeholder.video.encoding.rate.min']
                  }
                  addonAfter="bps" />

              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.encoding.rate.max']}
                name="video.encoding.rate.max">

                <Input
                  placeholder={
                  t['groupForm.placeholder.video.encoding.rate.max']
                  }
                  addonAfter="bps" />

              </Form.Item>
            </Col>
          </Row>
          <Row gutter={80}>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.encoding.rate.default']}
                name="video.encoding.rate.default">

                <Input
                  placeholder={
                  t['groupForm.placeholder.video.encoding.rate.default']
                  }
                  addonAfter="bps" />

              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.encoding.frameRate']}
                name="video.encoding.frameRate">

                <Input
                  placeholder={
                  t['groupForm.placeholder.video.encoding.frameRate']
                  }
                  addonAfter="fps" />

              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.video.encoding.profile']}
                name="video.encoding.profile">

                <Input
                  placeholder={
                  t['groupForm.placeholder.video.encoding.profile']
                  }
                  addonAfter="bps" />

              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card>
          <h6 className="text-title-1 font-medium">
            {t['groupForm.title.audio']}
          </h6>
          <Row gutter={80}>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.audio.mode']}
                initialValue={'custom'}
                name="audio.mode">

                <Select placeholder={t['groupForm.placeholder.audio.mode']}>
                  <Select.Option value="custom">自定义</Select.Option>
                  <Select.Option value="mode1">模式1</Select.Option>
                  <Select.Option value="mode2">模式2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.audio.acquisition.channels']}
                name="audio.acquisition.channels">

                <Select
                  placeholder={
                  t['groupForm.placeholder.audio.acquisition.channels']
                  }>

                  <Select.Option value="1">1</Select.Option>
                  <Select.Option value="2">2</Select.Option>
                  <Select.Option value="3">3</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.audio.encoding.rate']}
                name="audio.encoding.rate">

                <Input
                  placeholder={t['groupForm.placeholder.audio.encoding.rate']}
                  addonAfter="bps" />

              </Form.Item>
            </Col>
          </Row>
          <Row gutter={80}>
            <Col span={8}>
              <Form.Item
                label={t['groupForm.form.label.audio.encoding.profile']}
                name="audio.encoding.profile">

                <Input
                  placeholder={
                  t['groupForm.placeholder.audio.encoding.profile']
                  }
                  addonAfter="fps" />

              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card style={{ marginBottom: '40px' }}>
          <h6 className="text-title-1 font-medium">
            {t['groupForm.title.explanation']}
          </h6>
          <Form.Item
            label={t['groupForm.form.label.explanation']}
            name="audio.explanation">

            <Input.TextArea
              placeholder={t['groupForm.placeholder.explanation']} />

          </Form.Item>
        </Card>
      </Form>
      <Flex
        className={styles.actions}
        style={{ flexDirection: 'row-reverse' }}
      >
        <Space>
          <Button onClick={handleReset} size="large">
            {t['groupForm.reset']}
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            size="large">

            {t['groupForm.submit']}
          </Button>
        </Space>
      </Flex>
    </div>);

}

export default GroupForm;