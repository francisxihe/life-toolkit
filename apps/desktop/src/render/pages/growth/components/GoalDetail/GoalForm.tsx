import { useEffect, useState, useMemo } from 'react';
import { Input, DatePicker, Select, Form, Radio, Tag, Flex, type FormRule, Row, Col } from '@sue/design-web-react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { GoalService } from '@true-north/web-service';
import { GoalType } from '@true-north/enum';
import { useGoalDetailContext } from './context';
import { IMPORTANCE_MAP, DIFFICULTY_MAP } from '../../constants';
import GoalTreeSelector from '../GoalTreeSelector';
import { useGoalFormConstraints } from './hooks';
import { ProductSurface, productRef } from '@true-north/product-wiki';

const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function GoalForm() {
  const {
    currentGoal,
    initialFormData,
    goalFormData,
    setGoalFormData,
    readonly,
  } = useGoalDetailContext();

  const [form] = Form.useForm();
  const [parentGoal, setParentGoal] = useState(null);

  // 确保 initialFormData 中的 parentId 能正确显示
  useEffect(() => {
    if (initialFormData) {
      // 对于新建目标，直接设置所有字段值
      form.setFieldsValue(initialFormData);
    }
  }, [initialFormData, form]);

  // 获取父目标信息
  useEffect(() => {
    const fetchParentGoal = async () => {
      if (goalFormData?.parentId) {
        try {
          const parent = await GoalService.find(goalFormData.parentId);
          setParentGoal(parent);
        } catch (error) {
          console.error('获取父目标信息失败:', error);
          setParentGoal(null);
        }
      } else {
        setParentGoal(null);
      }
    };

    fetchParentGoal();
  }, [goalFormData.parentId]);

  const {
    allowedDateRange,
    allowedTypes,
    allowedImportance,
    allowedDifficulty,
    updateByConstraints,
  } = useGoalFormConstraints(parentGoal);

  // 当父目标变化时，检查并调整当前值
  useEffect(() => {
    if (parentGoal) {
      const updates = updateByConstraints(goalFormData);
      form.setFieldsValue(updates);
      if (Object.keys(updates).length > 0) {
        setGoalFormData((prev) => ({ ...prev, ...updates }));
      }
    }
  }, [parentGoal]);

  return (
    <Form
      form={form}
      initialValues={goalFormData}
      onValuesChange={(changedValues, allValues) => {
        console.log('onValuesChange', changedValues, allValues);
        setGoalFormData((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      <Row gutter={[16, 16]} className="p-2">
        <Item
          span={24}
          label="目标名称"
          name="name"
          rules={[{ required: true }]}
        >
          <Input placeholder="准备做什么?" disabled={readonly} />
        </Item>
        <Item span={24} label="父级目标" name="parentId">
          <GoalTreeSelector
            placeholder="请选择父级目标"
            excludeId={currentGoal?.id}
            allowClear
            disabled={readonly}
          />
        </Item>
        <ProductSurface id={productRef('growth.goal.rule.time-frame')}>
        <Item
          span={24}
          label="时间范围"
          name="planTimeRange"
          rules={[{ required: true }]}
          slot={{
            bottom:
              readonly ||
              (parentGoal && allowedDateRange && (
                <Flex align="flex-start" gap={4} className="text-xs text-orange-600 mt-1">
                  <span>
                    父目标日期范围限制：{allowedDateRange[0]} ~{' '}
                    {allowedDateRange[1]}
                  </span>
                </Flex>
              )),
          }}
        >
          <RangePicker
            className="w-full rounded-md"
            allowClear
            format="YYYY-MM-DD"
            disabled={readonly}
            disabledDate={(current) => {
              if (!allowedDateRange) return false;
              const [minDate, maxDate] = allowedDateRange;
              return (
                current.isBefore(dayjs(minDate)) ||
                current.isAfter(dayjs(maxDate))
              );
            }}
            placeholder={
              allowedDateRange
                ? [
                    `最早: ${allowedDateRange[0]}`,
                    `最晚: ${allowedDateRange[1]}`,
                  ]
                : ['开始日期', '结束日期']
            }
          />
        </Item>
        </ProductSurface>
        <ProductSurface id={productRef('growth.goal.rule.type')}>
        <Item
          span={24}
          label="目标类型"
          name="type"
          rules={[{ required: true }]}
          slot={{
            bottom:
              readonly ||
              (parentGoal && parentGoal.type === GoalType.RESULT && (
                <Flex align="flex-start" gap={4} className="text-xs text-orange-600 mt-1">
                  <span>父目标是成果，子目标只能是成果</span>
                </Flex>
              )),
          }}
        >
          <Radio.Group disabled={readonly}>
            <Radio
              value={GoalType.VISION}
              disabled={readonly || !allowedTypes.includes(GoalType.VISION)}
            >
              愿景
            </Radio>
            <Radio
              value={GoalType.RESULT}
              disabled={readonly || !allowedTypes.includes(GoalType.RESULT)}
            >
              成果
            </Radio>
          </Radio.Group>
        </Item>
        </ProductSurface>
        <ProductSurface id={productRef('growth.goal.rule.priority-inheritance')}>
        <Item
          span={12}
          label="重要程度"
          name="importance"
          rules={[{ required: true }]}
          slot={{
            bottom:
              readonly ||
              (parentGoal &&
                allowedImportance.length <
                  [...IMPORTANCE_MAP.keys()].length && (
                  <Flex align="flex-start" gap={4} className="text-xs text-orange-600 mt-1">
                    <span>⚠️</span>
                    <span>
                      重要程度不能高于父目标：
                      {IMPORTANCE_MAP.get(parentGoal.importance)?.label}
                    </span>
                  </Flex>
                )),
          }}
        >
          <Select
            popupMatchSelectWidth={false}
            disabled={readonly}
          >
            {[...IMPORTANCE_MAP.entries()].map(([key, value]) => (
              <Select.Option
                key={key}
                value={key}
                disabled={!allowedImportance.includes(key)}
              >
                <Tag color={value.color || 'gray'} className={clsx('m-1')}>
                  {value.label}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        </Item>
        <Item
          span={12}
          label="完成难度"
          name="difficulty"
          rules={[{ required: true }]}
        >
          <Select
            value={goalFormData.difficulty}
            popupMatchSelectWidth={false}
            disabled={readonly}
          >
            {[...DIFFICULTY_MAP.entries()].map(([key, value]) => (
              <Select.Option
                key={key}
                value={key}
                disabled={!allowedDifficulty.includes(key)}
              >
                <Tag color={value.color || 'gray'} className="m-1">
                  {value.label}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        </Item>
        </ProductSurface>
        <Item span={24} label="描述" name="description">
          <TextArea
            autoSize={false}
            placeholder="描述一下"
            disabled={readonly}
          />
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
  slot?: {
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    bottom?: React.ReactNode;
  };
}) {
  const { size } = useGoalDetailContext();

  const labelCol =
    size === 'small' ? (4 * 24) / props.span : (3 * 24) / props.span;
  const wrapperCol = 24 - labelCol;

  const { prefix, suffix, bottom } = props.slot || {};

  if (prefix || suffix || bottom) {
    return (
      <Col span={props.span} className="w-full flex items-center !p-0">
        <Form.Item
          label={<span className="pl-2">{props.label}</span>}
          labelAlign="left"
          labelCol={{ span: labelCol }}
          wrapperCol={{ span: wrapperCol }}
          requiredSymbol={{ position: 'end' }}
          rules={props.rules}
          className={clsx(
            '[&_.sue-form-item-label>label]:flex',
            '[&_.sue-form-item-label>label]:items-center',
            '[&_.sue-form-item-label>label]:gap-1',
          )}
        >
          <Form.Item
            name={props.name}
            rules={props.rules}
            noStyle={{ showErrorTip: true }}
          >
            {props.children}
          </Form.Item>
          {bottom}
        </Form.Item>
      </Col>
    );
  }

  return (
    <Col span={props.span} className="w-full flex items-center !p-0">
      <Form.Item
        name={props.name}
        label={<span className="pl-2">{props.label}</span>}
        labelAlign="left"
        labelCol={{ span: labelCol }}
        wrapperCol={{ span: wrapperCol }}
        rules={props.rules}
        requiredSymbol={{ position: 'end' }}
        className={clsx(
          '[&_.sue-form-item-label>label]:flex',
          '[&_.sue-form-item-label>label]:items-center',
          '[&_.sue-form-item-label>label]:gap-1',
        )}
      >
        {props.children}
      </Form.Item>
    </Col>
  );
}
