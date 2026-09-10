import { Input, InputNumber, DatePicker, Switch, Spin, Select, Form, type FormRule, Row, Col } from '@sue/design-web-react';

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  normalizeTaskPlanTimeRange,
  useTaskDetailContext,
} from './context';
import GoalTreeSelector from '../GoalTreeSelector';
import { useTaskFormConstraints } from './hooks';
import { TaskService, GoalService } from '@true-north/web-service';
import { DIFFICULTY_MAP, IMPORTANCE_MAP } from '../../constants';

const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function TaskForm() {
  const { loading, currentTask, taskList, taskFormData, setTaskFormData } =
    useTaskDetailContext();

  const [form] = Form.useForm();
  const [parentTask, setParentTask] = useState(null);
  const [parentGoal, setParentGoal] = useState(null);

  // 判断是否为创建模式（没有 currentTask.id）
  const isCreateMode = !currentTask?.id;

  // 创建模式下，如果有父任务id或目标id，则不显示是否子任务开关
  const shouldHideSubTaskSwitch =
    isCreateMode && (taskFormData?.parentId || taskFormData?.goalId);

  const normalizedPlanTimeRange = useMemo(
    () => normalizeTaskPlanTimeRange(taskFormData.planTimeRange),
    [taskFormData.planTimeRange],
  );

  useEffect(() => {
    if (!loading && currentTask?.id) {
      form.setFieldsValue({
        ...taskFormData,
        planTimeRange: normalizedPlanTimeRange,
      });
    }
  }, [currentTask?.id, form, loading, normalizedPlanTimeRange, taskFormData]);

  // 获取父任务信息
  useEffect(() => {
    const fetchParentTask = async () => {
      if (taskFormData?.parentId) {
        try {
          const parent = await TaskService.find(taskFormData.parentId);
          setParentTask(parent);
        } catch (error) {
          console.error('获取父任务信息失败:', error);
          setParentTask(null);
        }
      } else {
        setParentTask(null);
      }
    };

    fetchParentTask();
  }, [taskFormData?.parentId]);

  // 获取父目标信息
  useEffect(() => {
    const fetchParentGoal = async () => {
      if (taskFormData?.goalId) {
        try {
          const goal = await GoalService.find(taskFormData.goalId);
          setParentGoal(goal);
        } catch (error) {
          console.error('获取父目标信息失败:', error);
          setParentGoal(null);
        }
      } else {
        setParentGoal(null);
      }
    };

    fetchParentGoal();
  }, [taskFormData?.goalId]);

  const { allowedDateRange, allowedImportance, allowedDifficulty, updateByConstraints } =
    useTaskFormConstraints(parentTask, parentGoal);
  const constraintOwner = parentTask ? '父任务' : '目标';
  const datePlaceholder = allowedDateRange
    ? [
        `开始时间（最早：${dayjs(allowedDateRange[0]).format('YYYY-MM-DD HH:mm')}）`,
        `结束时间（最晚：${dayjs(allowedDateRange[1]).format('YYYY-MM-DD HH:mm')}）`,
      ]
    : ['开始时间', '结束时间'];
  const importancePlaceholder =
    (parentTask || parentGoal) &&
    allowedImportance.length < [...IMPORTANCE_MAP.keys()].length
      ? `不高于${constraintOwner}：${IMPORTANCE_MAP.get((parentTask || parentGoal).importance)?.label}`
      : '请选择重要程度';

  // 当父任务或父目标变化时，检查并调整当前值
  useEffect(() => {
    if (parentTask || parentGoal) {
      const updates = updateByConstraints(taskFormData);
      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
        setTaskFormData((prev) => ({ ...prev, ...updates }));
      }
    }
  }, [
    parentTask,
    parentGoal,
    taskFormData,
    form,
    setTaskFormData,
    updateByConstraints,
  ]);

  if (loading) {
    return <Spin dot />;
  }
  if (!taskFormData) return null;
  return (
    <Form
      form={form}
      initialValues={{ ...taskFormData, planTimeRange: normalizedPlanTimeRange }}
      onValuesChange={(changedValues) => {
        setTaskFormData((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      <Row gutter={[16, 16]} className="p-2">
        <Item
          span={24}
          label="任务名称"
          name="name"
          rules={[{ required: true }]}
        >
          <Input placeholder="准备做什么?" />
        </Item>
        {/* 创建模式下如果有父任务id或目标id则不显示是否子任务开关 */}
        {!shouldHideSubTaskSwitch && (
          <Item span={24} label="是否子任务" name="isSubTask" valuePropName="checked">
            <Switch checked={taskFormData.isSubTask} />
          </Item>
        )}
        {taskFormData.isSubTask ? (
          <Item
            span={24}
            label="父任务"
            name="parentId"
            rules={[{ required: true, message: '请选择父任务' }]}
          >
            <Select
              options={taskList.map((task) => ({
                label: task.name,
                value: task.id,
                disabled: task.id === currentTask?.id,
              }))}
            />
          </Item>
        ) : (
          <Item
            span={24}
            label="目标"
            name="goalId"
            rules={[{ required: true, message: '请选择关联目标' }]}
          >
            <GoalTreeSelector
              placeholder="请选择父级目标"
            />
          </Item>
        )}
        <Item span={24} label="日期" name="planTimeRange">
          <RangePicker
            className="w-full rounded-md"
            allowClear
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', showSecond: false }}
            disabledDate={(current) => {
              if (!allowedDateRange) return false;
              const [minDate, maxDate] = allowedDateRange;
              return (
                current.isBefore(dayjs(minDate)) ||
                current.isAfter(dayjs(maxDate))
              );
            }}
            placeholder={datePlaceholder}
          />
        </Item>
        <Item span={12} label="预估时间" name="estimateTime">
          <InputNumber min={0} step={60} placeholder="秒" />
        </Item>
        <Item span={24} label="重要程度" name="importance">
          <Select
            placeholder={importancePlaceholder}
            options={[...IMPORTANCE_MAP.entries()].map(([key, value]) => ({
              label: value.label,
              value: key,
              disabled: !allowedImportance.includes(key),
            }))}
          />
        </Item>
        <Item span={24} label="难度" name="difficulty">
          <Select
            placeholder="请选择难度"
            options={[...DIFFICULTY_MAP.entries()].map(([key, value]) => ({
              label: value.label,
              value: key,
              disabled: !allowedDifficulty.includes(key),
            }))}
          />
        </Item>
        <Item span={24} label="描述" name="description">
          <TextArea autoSize={false} placeholder="描述一下" />
        </Item>
      </Row>
    </Form>
  );
}

function Item(props: {
  span: number;
  label: string;
  children: React.ReactNode;
  name: string;
  rules?: FormRule[];
  valuePropName?: string;
}) {
  const { size } = useTaskDetailContext();
  const labelCol =
    size === 'small' ? (4 * 24) / props.span : (3 * 24) / props.span;
  const wrapperCol = 24 - labelCol;

  return (
    <Col span={props.span} className="w-full flex items-center !p-0">
      <Form.Item
        name={props.name}
        label={<span className="pl-2">{props.label}</span>}
        labelAlign="left"
        labelCol={{ span: labelCol }}
        wrapperCol={{ span: wrapperCol }}
        rules={props.rules}
        valuePropName={props.valuePropName}
      >
        {props.children}
      </Form.Item>
    </Col>
  );
}
