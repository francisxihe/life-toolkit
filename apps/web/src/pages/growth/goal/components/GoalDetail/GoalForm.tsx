import {
  Input,
  Grid,
  DatePicker,
  Select,
  Form,
  Radio,
  Spin,
} from '@arco-design/web-react';
import { useGoalDetailContext } from './context';
import { GoalType } from '@life-toolkit/vo/growth';
import { useComponentLoad } from '@/hooks/lifecycle';

const { Row, Col } = Grid;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function GoalForm() {
  const { goalFormData, setGoalFormData, goalList, currentGoal, loading } =
    useGoalDetailContext();

  const [form] = Form.useForm();

  const { handleComponentLoaded } = useComponentLoad(async () => {
    if (currentGoal?.id) {
      form.setFieldsValue(goalFormData);
      handleComponentLoaded();
    }
  });

  if (loading) {
    return <Spin dot />;
  }
  if (!goalFormData) return null;
  return (
    <Form
      form={form}
      initialValues={goalFormData}
      onValuesChange={(changedValues) => {
        setGoalFormData((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      <Row gutter={[16, 16]} className="p-2">
        <Item span={24} label="目标名称" name="name">
          <Input placeholder="准备做什么?" />
        </Item>
        <Item span={24} label="日期" name="planTimeRange">
          <RangePicker
            className="w-full rounded-md"
            allowClear
            format="YYYY-MM-DD"
          />
        </Item>
        <Item span={24} label="目标类型" name="type">
          <Radio.Group>
            <Radio value={GoalType.OBJECTIVE}>战略规划</Radio>
            <Radio value={GoalType.KEY_RESULT}>成果指标</Radio>
          </Radio.Group>
        </Item>

        <Item span={24} label="父级目标" name="parentId">
          <Select
            allowClear
            placeholder="请选择父级目标"
            options={goalList.map((goal) => ({
              label: goal.name,
              value: goal.id,
            }))}
          ></Select>
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
}) {
  const { size } = useGoalDetailContext();

  const labelCol =
    size === 'small' ? (4 * 24) / props.span : (3 * 24) / props.span;
  const wrapperCol = 24 - labelCol;

  return (
    <Col span={props.span} className="w-full flex items-center !p-0">
      <Form.Item
        field={props.name}
        label={<span className="pl-2">{props.label}</span>}
        labelAlign="left"
        labelCol={{ span: labelCol }}
        wrapperCol={{ span: wrapperCol }}
      >
        {props.children}
      </Form.Item>
    </Col>
  );
}
