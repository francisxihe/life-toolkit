import React, { useState } from 'react';

import { Modal, Form, Input, SettingOutlined } from '@sue/design-web-react';

interface SettingProps {
  onConfirm: (form: { countdown: number }) => void;
  className?: string;
}

interface FormValues {
  countdown: number;
}

const Setting: React.FC<SettingProps> = ({ onConfirm, className }) => {
  const [settingVisible, setSettingVisible] = useState(false);
  const [form, setForm] = useState<FormValues>({
    countdown: 1500,
  });

  const onClickSetting = () => {
    setSettingVisible(true);
  };

  const onOkModal = () => {
    setSettingVisible(false);
    onConfirm(form);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      countdown: Number(event.target.value),
    });
  };

  return (
    <>
      <SettingOutlined
        onClick={onClickSetting}
        className={className}
        style={{ color: '#fff', fontSize: '30px' }}
      />
      <Modal
        title="基本设置"
        open={settingVisible}
        onOk={onOkModal}
        onCancel={() => setSettingVisible(false)}
      >
        <Form>
          <Form.Item label="倒计时时间">
            <Input
              value={String(form.countdown)}
              onChange={handleInputChange}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Setting;
