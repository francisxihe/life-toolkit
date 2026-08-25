'use client';

import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Switch,
  TimePicker,
  Tooltip,
} from '@sue/design-web-react';
import RepeatSelector, {
  createDefaultRepeatSetting,
  type RepeatSelectorValue,
} from '@true-north/components-repeat';
import { ProductSurface } from '@ylib/product-server';
import { productRef } from '@true-north/product-wiki';
import type { TodoFormData } from '@true-north/web-service';
import { TrackTimeController } from '@true-north/web-service';
import {
  TodoRelatedType,
  TodoStatus,
  TrackTimeRelatedType,
} from '@true-north/enum';
import { TrackTime as TrackTimeVO } from '@true-north/vo';
import { IMPORTANCE_MAP, URGENCY_MAP } from '../../../constants';
import { useTodoDetailContext } from '../context';
import {
  DEFAULT_PLAN_TIME,
  defaultTimeRange,
  isTodoPlanRange,
  normalizePlanTimeRange,
  toDayjsTime,
} from '../planTime';
import { openFocusTimer } from '../../../focus-timer';
import styles from '../style.module.less';

const { TextArea } = Input;

type TodoFormValues = {
  name: string;
  description?: string;
  planDate: Dayjs;
  importance?: number;
  urgency?: number;
};

type TodoFormProps = {
  onClose?: () => void | Promise<void>;
};

function toFormValues(data: TodoFormData): TodoFormValues {
  return {
    name: data.name,
    description: data.description,
    planDate: dayjs(data.planDate),
    importance: data.importance,
    urgency: data.urgency,
  };
}

function toFormPatch(
  changedValues: Partial<TodoFormValues>,
): Partial<TodoFormData> {
  const patch: Partial<TodoFormData> = {};
  if ('name' in changedValues) {
    patch.name =
      typeof changedValues.name === 'string' ? changedValues.name : '';
  }
  if ('description' in changedValues) {
    patch.description =
      typeof changedValues.description === 'string'
        ? changedValues.description
        : undefined;
  }
  if ('planDate' in changedValues && changedValues.planDate) {
    patch.planDate = changedValues.planDate.format('YYYY-MM-DD');
  }
  if ('importance' in changedValues)
    patch.importance = changedValues.importance;
  if ('urgency' in changedValues) patch.urgency = changedValues.urgency;
  return patch;
}

function toTodoRepeat(
  value: RepeatSelectorValue | undefined,
  planDate: string,
): TodoFormData['repeatConfig'] {
  return value
    ? ({
        ...value,
        currentDate: planDate,
        repeatStartDate: value.repeatStartDate || planDate,
      } as unknown as TodoFormData['repeatConfig'])
    : undefined;
}

function formatDuration(totalSeconds?: number) {
  const seconds = Math.max(0, totalSeconds || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`;
  return `${minutes} 分钟`;
}

export default function TodoForm(props: TodoFormProps) {
  const { mode, todoFormData, setTodoFormData, onSubmit, currentTodo } =
    useTodoDetailContext();
  const [form] = Form.useForm<TodoFormValues>();
  const [trackRecords, setTrackRecords] = useState<TrackTimeVO.TrackTimeVo[]>(
    [],
  );

  useEffect(() => {
    form.setFieldsValue(toFormValues(todoFormData));
  }, [form, todoFormData]);

  useEffect(() => {
    if (mode !== 'editor' || !currentTodo?.id) {
      setTrackRecords([]);
      return;
    }
    void TrackTimeController.findByRelatedId(
      TrackTimeRelatedType.TODO,
      currentTodo.id,
    )
      .then((response) => setTrackRecords(response?.list || []))
      .catch(() => setTrackRecords([]));
  }, [mode, currentTodo?.id]);

  const isEditor = mode === 'editor';
  const repeatValue = todoFormData.repeatConfig as
    RepeatSelectorValue | undefined;
  const [planStart, planEnd] = normalizePlanTimeRange(
    todoFormData.planTimeRange ?? [DEFAULT_PLAN_TIME, DEFAULT_PLAN_TIME],
  );
  const settledTimes = todoFormData.settledTimes ?? 0;
  const relatedType = currentTodo?.relatedType ?? todoFormData.relatedType;
  const isSystemSourced =
    relatedType === TodoRelatedType.HABIT ||
    relatedType === TodoRelatedType.TASK ||
    relatedType === TodoRelatedType.GOAL ||
    Boolean(todoFormData.taskId || todoFormData.habitId);
  const canFocus =
    isEditor &&
    currentTodo?.status === TodoStatus.TODO &&
    isTodoPlanRange(planStart, planEnd);
  const isPointPlan = !isTodoPlanRange(planStart, planEnd);

  async function handleSubmit() {
    try {
      await form.validateFields();
      if (await onSubmit()) await props.onClose?.();
    } catch {
      // Form validation keeps the drawer open and displays field errors.
    }
  }

  return (
    <ProductSurface id={productRef('growth.todo.rule.related-inheritance')}>
    <Flex vertical className={styles.container}>
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
        initialValues={toFormValues(todoFormData)}
        onValuesChange={(changedValues) => {
          const patch = toFormPatch(changedValues);
          if (patch.planDate && todoFormData.repeatConfig) {
            patch.repeatConfig = toTodoRepeat(
              {
                ...todoFormData.repeatConfig,
                repeatStartDate: settledTimes
                  ? todoFormData.repeatConfig.repeatStartDate
                  : patch.planDate,
              } as RepeatSelectorValue,
              patch.planDate,
            );
          }
          if (Object.keys(patch).length > 0) setTodoFormData(patch);
        }}
      >
        <Form.Item
          label="待办名称"
          name="name"
          rules={[{ required: true, message: '请输入待办名称' }]}
        >
          <Input placeholder="准备做什么?" maxLength={100} />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <TextArea placeholder="描述一下" rows={4} maxLength={500} showCount />
        </Form.Item>
        <Form.Item
          label={
            <Flex justify="space-between" align="center" gap={8}>
              计划日期
              {!isEditor && (
                <Tooltip title="启用重复">
                  <ProductSurface id={productRef('growth.todo.rule.edit-no-repeat-toggle')}>
                  <Switch
                    size="small"
                    checked={Boolean(repeatValue)}
                    onChange={(enabled) => {
                      setTodoFormData({
                        repeatConfig: enabled
                          ? toTodoRepeat(
                              repeatValue ??
                                createDefaultRepeatSetting(
                                  todoFormData.planDate,
                                ),
                              todoFormData.planDate,
                            )
                          : undefined,
                      });
                    }}
                  />
                  </ProductSurface>
                </Tooltip>
              )}
            </Flex>
          }
          name="planDate"
          rules={[{ required: true, message: '请选择计划日期' }]}
        >
          {!repeatValue && (
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              allowClear={false}
            />
          )}
          {repeatValue && !isSystemSourced && (
            <ProductSurface id={productRef('growth.todo.rule.repeat-template')}>
              <ProductSurface id={productRef('growth.repeat.interaction')}>
            <RepeatSelector
              lang="zh-CN"
              value={repeatValue}
              onChange={(value) => {
                const nextPlanDate = settledTimes
                  ? todoFormData.planDate
                  : value.repeatStartDate || todoFormData.planDate;
                setTodoFormData({
                  planDate: nextPlanDate,
                  repeatConfig: toTodoRepeat(value, nextPlanDate),
                });
                form.setFieldValue('planDate', dayjs(nextPlanDate));
              }}
            />
              </ProductSurface>
            </ProductSurface>
          )}
        </Form.Item>

        <Form.Item
          label={
            <Flex justify="space-between" align="center" gap={8}>
              计划时间
              <Radio.Group
                size="small"
                optionType="button"
                value={isTodoPlanRange(planStart, planEnd) ? 'range' : 'point'}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === 'point') {
                    setTodoFormData({ planTimeRange: [planStart, planStart] });
                    return;
                  }
                  const range = defaultTimeRange(planStart);
                  setTodoFormData({
                    planTimeRange: [range.start, range.end],
                  });
                }}
              >
                <Radio value="point">时间点</Radio>
                <Radio value="range">时间范围</Radio>
              </Radio.Group>
            </Flex>
          }
          required
        >
          <Flex vertical gap={8}>
            {isTodoPlanRange(planStart, planEnd) ? (
              <TimePicker.RangePicker
                allowClear={false}
                format="HH:mm"
                minuteStep={5}
                value={[toDayjsTime(planStart)!, toDayjsTime(planEnd)!]}
                className="w-full"
                onChange={(range) => {
                  if (!range?.[0] || !range[1]) return;
                  const nextStart = range[0].format('HH:mm');
                  const nextEnd = range[1].format('HH:mm');
                  if (nextStart < nextEnd) {
                    setTodoFormData({ planTimeRange: [nextStart, nextEnd] });
                  }
                }}
              />
            ) : (
              <TimePicker
                allowClear={false}
                format="HH:mm"
                minuteStep={5}
                value={toDayjsTime(planStart)}
                className="w-full"
                onChange={(time) => {
                  if (!time) return;
                  const point = time.format('HH:mm');
                  setTodoFormData({ planTimeRange: [point, point] });
                }}
              />
            )}
          </Flex>
        </Form.Item>
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item label="重要程度" name="importance">
              <Select
                allowClear
                placeholder="请选择重要程度"
                options={[...IMPORTANCE_MAP.entries()].map(
                  ([value, option]) => ({
                    value,
                    label: option.label,
                  }),
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="紧急程度" name="urgency">
              <Select
                allowClear
                placeholder="请选择紧急程度"
                options={[...URGENCY_MAP.entries()]
                  .filter(([value]) => value !== null)
                  .map(([value, option]) => ({ value, label: option.label }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {isEditor && currentTodo && (
          <ProductSurface id={productRef('growth.todo.rule.focus-range-only')}>
            <ProductSurface id={productRef('growth.track-time.rule.todo-range-focus')}>
          <Form.Item label="专注记录">
            <Flex vertical gap={8}>
              {canFocus ? (
                <Button
                  type="primary"
                  onClick={() =>
                    openFocusTimer({
                      todoId: currentTodo.id,
                      label: currentTodo.name,
                    })
                  }
                >
                  开始专注计时
                </Button>
              ) : isPointPlan && currentTodo.status === TodoStatus.TODO ? (
                <Alert
                  type="info"
                  showIcon
                  title="时间点待办不可从本入口管理计时；已有记录仍可查看。"
                />
              ) : null}
              {trackRecords.length ? (
                trackRecords.map((record) => (
                  <Flex key={record.id} justify="space-between" align="center">
                    <span>
                      {record.startAt
                        ? dayjs(record.startAt).format('YYYY-MM-DD HH:mm')
                        : '专注记录'}
                    </span>
                    <strong>{formatDuration(record.duration)}</strong>
                  </Flex>
                ))
              ) : (
                <Empty description="暂无关联专注记录" />
              )}
            </Flex>
          </Form.Item>
            </ProductSurface>
          </ProductSurface>
        )}
      </Form>

      <Flex className={styles.footer} justify="flex-end" gap={8}>
        <Button onClick={() => props.onClose?.()}>取消</Button>
        <Button type="primary" onClick={handleSubmit}>
          确认
        </Button>
      </Flex>
    </Flex>
    </ProductSurface>
  );
}
