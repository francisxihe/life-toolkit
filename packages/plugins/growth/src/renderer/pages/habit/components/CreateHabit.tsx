import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, message, Divider, Row, Col } from '@sue/design-web-react';

import { HabitController } from '../../../../client';
import { CreateHabitVo, GoalVo, HabitVo } from '@true-north/vo';
import { Difficulty } from '@true-north/enum';
import dayjs from 'dayjs';
import { DIFFICULTY_MAP, IMPORTANCE_MAP } from '../../constants';
import RepeatSelector, { createDefaultRepeatSetting, type RepeatSelectorValue } from '@true-north/components-repeat';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { emitHabitChanged } from '../../events';

const { TextArea } = Input;
const { Option } = Select;

interface CreateHabitProps {
  goals: GoalVo[];
  onSuccess: () => void;
  onCancel: () => void;
  habit?: HabitVo;
}

export const CreateHabit: React.FC<CreateHabitProps> = ({
  goals,
  onSuccess,
  onCancel,
  habit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const isCreate = !habit;
  const hideAdvanced = isCreate && !moreOpen;
  const [repeatSetting, setRepeatSetting] = useState<RepeatSelectorValue>(() =>
    createDefaultRepeatSetting(dayjs().format('YYYY-MM-DD'))
  );

  // 重置表单
  useEffect(() => {
    form.resetFields();
    if (!habit) {
      setRepeatSetting(createDefaultRepeatSetting(dayjs().format('YYYY-MM-DD')));
      return;
    }
    form.setFieldsValue({
      name: habit.name,
      description: habit.description,
      importance: habit.importance,
      difficulty: habit.difficulty,
      tags: habit.tags,
      goalIds: habit.goals?.map((goal) => goal.id) || [],
    });
    setRepeatSetting({
      repeatMode: habit.repeatMode,
      repeatConfig: habit.repeatConfig,
      repeatEndMode: habit.repeatEndMode,
      repeatStartDate: habit.repeatStartDate,
      repeatEndDate: habit.repeatEndDate,
      repeatTimes: habit.repeatTimes,
    } as RepeatSelectorValue);
  }, [form, habit]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const habitData: CreateHabitVo = {
        name: values.name,
        description: values.description,
        importance: values.importance || 3,
        difficulty: values.difficulty || Difficulty.Challenger,
        tags: values.tags || [],
        goalIds: values.goalIds,
        ...repeatSetting,
      };

      if (habit) {
        await HabitController.update(habit.id, habitData);
        message.success('习惯已更新');
      } else {
        await HabitController.create(habitData);
        message.success('习惯创建成功');
      }
      emitHabitChanged();
      onSuccess();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      console.error('创建习惯失败:', error);
      message.error('创建习惯失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{
          importance: 3,
          difficulty: Difficulty.Challenger,
          goalIds: [],
        }}
      >
        <Form.Item
          label="习惯名称"
          name="name"
          rules={[
            { required: true, message: '请输入习惯名称' },
            {
              type: 'string',
              min: 1,
              max: 50,
              message: '习惯名称长度为1-50个字符'
            },
          ]}
        >
          <Input placeholder="请输入习惯名称，如：每日阅读30分钟" />
        </Form.Item>

        <Form.Item
          label="关联目标"
          name="goalIds"
          required
          extra="每个习惯必须关联至少一个目标，习惯的执行将推进目标的达成"
          rules={[
            { required: true, type: 'array', min: 1, message: '请至少选择一个关联目标' },
          ]}
        >
          <Select
            mode="multiple"
            placeholder={
              goals.length === 0
                ? '暂无可关联的目标，请先创建目标'
                : '请选择要支撑的目标'
            }
            disabled={goals.length === 0}
            style={{ width: '100%' }}
            maxTagCount={3}
          >
            {goals.filter((goal) => goal.id).map((goal) => (
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
        </Form.Item>

        {isCreate ? (
          <Button type="link" className="px-0" onClick={() => setMoreOpen((open) => !open)}>
            {moreOpen ? '收起' : '更多'}
          </Button>
        ) : null}

        <div className={hideAdvanced ? 'hidden' : undefined}>
        <Form.Item
          label="习惯描述"
          name="description"
          rules={[{ type: 'string', max: 200, message: '描述长度不能超过200个字符' }]}
        >
          <TextArea
            placeholder="请描述这个习惯的具体内容和要求"
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="重要程度" name="importance">
              <Select
                placeholder="选择重要程度"
                options={[...IMPORTANCE_MAP.entries()].map(([value, option]) => ({
                  value,
                  label: option.label,
                  color: option.color
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="难度等级" name="difficulty">
              <Select
                placeholder="选择难度等级"
                options={[...DIFFICULTY_MAP.entries()].map(([value, option]) => ({
                  value,
                  label: option.label,
                  color: option.color
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="标签" name="tags">
          <Select
            mode="tags"
            placeholder="添加标签，最多5个"
            maxTagCount={5}
            allowClear
            style={{ width: '100%' }}
          />
        </Form.Item>
        </div>

        <div>
          <span className="block mb-2 font-medium">重复规则</span>
          <ProductSurface id={productRef('growth.repeat.interaction')}>
            <RepeatSelector lang="zh-CN" value={repeatSetting} onChange={setRepeatSetting} />
          </ProductSurface>
        </div>

        <Divider />
      </Form>

      <Space>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          {habit ? '保存' : '创建'}
        </Button>
      </Space>
    </div>
  );
};
