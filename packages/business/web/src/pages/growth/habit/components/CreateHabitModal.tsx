import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Message,
  Divider,
  Typography,
} from '@arco-design/web-react';
import { HabitController } from '@life-toolkit/api';
import {
  CreateHabitVo,
  HabitDifficulty,
  GoalVo,
} from '@life-toolkit/vo/growth';
import { HABIT_DIFFICULTY_OPTIONS } from '../constants';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateHabitProps {
  goals: GoalVo[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateHabit: React.FC<CreateHabitProps> = ({
  goals,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // 重置表单
  useEffect(() => {
    form.resetFields();
    setSelectedGoals([]);
  }, [form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validate();

      if (selectedGoals.length === 0) {
        Message.error('请至少选择一个关联目标');
        return;
      }

      setLoading(true);
      console.log('values', values);

      const habitData: CreateHabitVo = {
        name: values.name,
        description: values.description,
        importance: values.importance || 3,
        difficulty: values.difficulty || HabitDifficulty.MEDIUM,
        tags: values.tags || [],
        startAt: dayjs(values.startAt).format('YYYY-MM-DD'),
        targetAt: dayjs(values.targetAt).format('YYYY-MM-DD'),
        goalIds: selectedGoals,
      };

      await HabitController.createHabit(habitData);
      Message.success('习惯创建成功');
      onSuccess();
    } catch (error) {
      console.error('创建习惯失败:', error);
      Message.error('创建习惯失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理目标选择变更
  const handleGoalChange = (goalIds: string[]) => {
    setSelectedGoals(goalIds);
  };

  return (
    <div>
      <Form form={form} layout="vertical" autoComplete="off">
        {/* 基础信息 */}
        <Form.Item
          label="习惯名称"
          field="name"
          rules={[
            { required: true, message: '请输入习惯名称' },
            {
              minLength: 1,
              maxLength: 50,
              message: '习惯名称长度为1-50个字符',
            },
          ]}
        >
          <Input placeholder="请输入习惯名称，如：每日阅读30分钟" />
        </Form.Item>

        <Form.Item
          label="习惯描述"
          field="description"
          rules={[{ maxLength: 200, message: '描述长度不能超过200个字符' }]}
        >
          <TextArea
            placeholder="请描述这个习惯的具体内容和要求"
            rows={3}
            showWordLimit
            maxLength={200}
          />
        </Form.Item>

        {/* 目标关联 - 强制选择 */}
        <div>
          <Text className="block mb-2 font-medium">
            关联目标 <span className="text-red-500">*</span>
          </Text>
          <Text type="secondary" className="block mb-3 text-sm">
            每个习惯必须关联至少一个目标，习惯的执行将推进目标的达成
          </Text>

          {goals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Text>暂无可关联的目标，请先创建目标</Text>
            </div>
          ) : (
            <Select
              mode="multiple"
              placeholder="请选择要支撑的目标"
              value={selectedGoals}
              onChange={handleGoalChange}
              style={{ width: '100%' }}
              maxTagCount={3}
            >
              {goals.map((goal) => (
                <Option key={goal.id} value={goal.id}>
                  <div>
                    <div className="font-medium">{goal.name}</div>
                    {goal.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {goal.description}
                      </div>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          )}

          {selectedGoals.length === 0 && (
            <Text type="error" className="text-sm mt-1">
              请至少选择一个关联目标
            </Text>
          )}
        </div>

        {/* 属性设置 */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="重要程度" field="importance" initialValue={3}>
            <InputNumber
              min={1}
              max={5}
              placeholder="1-5级"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="难度等级"
            field="difficulty"
            initialValue={HabitDifficulty.MEDIUM}
          >
            <Select placeholder="选择难度等级">
              {HABIT_DIFFICULTY_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <span style={{ color: option.color }}>●</span>
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* 标签 */}
        <Form.Item label="标签" field="tags">
          <Select
            mode="multiple"
            placeholder="添加标签，最多5个"
            maxTagCount={5}
            allowCreate
            allowClear
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 时间设置 */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="开始日期"
            field="startAt"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(date) => date.isBefore(new Date(), 'day')}
            />
          </Form.Item>

          <Form.Item label="目标日期" field="targetAt">
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(date) => {
                const startDate = form.getFieldValue('startAt');
                return startDate
                  ? date.isBefore(startDate, 'day')
                  : date.isBefore(new Date(), 'day');
              }}
            />
          </Form.Item>
        </div>

        <Divider />
      </Form>

      <Space>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          创建
        </Button>
      </Space>
    </div>
  );
};
