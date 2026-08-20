import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, message, Divider } from '@sue/design-web-react';

import { HabitController } from '@true-north/web-service';
import { CreateHabitVo, GoalVo, HabitVo } from '@true-north/vo';
import { Difficulty } from '@true-north/enum';
import dayjs from 'dayjs';
import { DIFFICULTY_MAP, IMPORTANCE_MAP } from '../../constants';
import RepeatSelector, { createDefaultRepeatSetting, type RepeatSelectorValue } from '@true-north/components-repeat';
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
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [repeatSetting, setRepeatSetting] = useState<RepeatSelectorValue>(() =>
    createDefaultRepeatSetting(dayjs().format('YYYY-MM-DD'))
  );

  // 重置表单
  useEffect(() => {
    form.resetFields();
    if (!habit) {
      setSelectedGoals([]);
      setRepeatSetting(createDefaultRepeatSetting(dayjs().format('YYYY-MM-DD')));
      return;
    }
    form.setFieldsValue({
      name: habit.name,
      description: habit.description,
      importance: habit.importance,
      difficulty: habit.difficulty,
      tags: habit.tags,
    });
    setSelectedGoals(habit.goals?.map((goal) => goal.id) || []);
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

      if (selectedGoals.length === 0) {
        message.error('请至少选择一个关联目标');
        return;
      }

      setLoading(true);

      const habitData: CreateHabitVo = {
        name: values.name,
        description: values.description,
        importance: values.importance || 3,
        difficulty: values.difficulty || Difficulty.Challenger,
        tags: values.tags || [],
        goalIds: selectedGoals,
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
      console.error('创建习惯失败:', error);
      message.error('创建习惯失败');
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
          name="name"
          rules={[
          { required: true, message: '请输入习惯名称' },
          {
            minLength: 1,
            maxLength: 50,
            message: '习惯名称长度为1-50个字符'
          }]
          }>

          <Input placeholder="请输入习惯名称，如：每日阅读30分钟" />
        </Form.Item>

        <Form.Item
          label="习惯描述"
          name="description"
          rules={[{ maxLength: 200, message: '描述长度不能超过200个字符' }]}>

          <TextArea
            placeholder="请描述这个习惯的具体内容和要求"
            rows={3}
            showCount
            maxLength={200} />

        </Form.Item>

        {/* 目标关联 - 强制选择 */}
        <div>
          <span className="block mb-2 font-medium">
            关联目标 <span className="text-red-500">*</span>
          </span>
          <span className="text-text-3 block mb-3 text-sm">
            每个习惯必须关联至少一个目标，习惯的执行将推进目标的达成
          </span>

          {goals.length === 0 ?
          <div className="text-center py-4 text-gray-500">
              <span>暂无可关联的目标，请先创建目标</span>
            </div> :

          <Select
            mode="multiple"
            placeholder="请选择要支撑的目标"
            value={selectedGoals}
            onChange={handleGoalChange}
            style={{ width: '100%' }}
            maxTagCount={3}>

              {goals.filter((goal) => goal.id).map((goal) =>
            <Option key={goal.id} value={goal.id}>
                  <div>
                    <div className="font-medium">{goal.name}</div>
                    {goal.description &&
                <div className="text-sm text-gray-500 truncate">
                        {goal.description}
                      </div>
                }
                  </div>
                </Option>
            )}
            </Select>
          }

          {selectedGoals.length === 0 &&
          <span className="text-sm mt-1" style={{ color: "#f53f3f" }}>
              请至少选择一个关联目标
            </span>
          }
        </div>

        {/* 属性设置 */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="重要程度" name="importance" initialValue={3}>
            <Select
              placeholder="选择重要程度"
              options={[...IMPORTANCE_MAP.entries()].map(([value, option]) => ({
                value,
                label: option.label,
                color: option.color
              }))}>
            </Select>
          </Form.Item>

          <Form.Item
            label="难度等级"
            name="difficulty"
            initialValue={Difficulty.Challenger}>

            <Select
              placeholder="选择难度等级"
              options={[...DIFFICULTY_MAP.entries()].map(([value, option]) => ({
                value,
                label: option.label,
                color: option.color
              }))}>
            </Select>
          </Form.Item>
        </div>

        {/* 标签 */}
        <Form.Item label="标签" name="tags">
          <Select
            mode="tags"
            placeholder="添加标签，最多5个"
            maxTagCount={5}
            allowClear
            style={{ width: '100%' }} />

        </Form.Item>

        <div>
          <span className="block mb-2 font-medium">重复规则</span>
          <RepeatSelector lang="zh-CN" value={repeatSetting} onChange={setRepeatSetting} />
        </div>

        <Divider />
      </Form>

      <Space>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          {habit ? '保存' : '创建'}
        </Button>
      </Space>
    </div>);

};
