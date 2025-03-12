import {
  Input,
  Grid,
  DatePicker,
  Select,
  Form,
  Radio,
} from '@arco-design/web-react';
import { useGoalDetailContext } from './context';
import { GoalType } from '@life-toolkit/vo/growth';

const { Row, Col } = Grid;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function GoalForm() {
  const { goalFormData, setGoalFormData, onChange, goalList } =
    useGoalDetailContext();

  const [form] = Form.useForm();

  return goalFormData ? (
    <Form
      form={form}
      initialValues={goalFormData}
      onValuesChange={(changedValues) => {
        setGoalFormData((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      <Row gutter={[16, 16]} className="p-2">
        <Item span={24} label="目标名称" name="name">
          <Input
            placeholder="准备做什么?"
            onBlur={() => {
              onChange({
                name: goalFormData.name.trim(),
              });
            }}
          />
        </Item>
        <Item span={24} label="日期" name="planTimeRange">
          <RangePicker
            className="w-full rounded-md"
            allowClear
            format="YYYY-MM-DD"
            onOk={(value) => {
              onChange({
                startAt: value[0],
                endAt: value[1],
              });
            }}
          />
        </Item>
        <Item span={24} label="目标类型" name="type">
          <Radio.Group
            onChange={() => {
              onChange({
                type: goalFormData.type,
              });
            }}
          >
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
          <TextArea
            autoSize={false}
            placeholder="描述一下"
            onBlur={() => {
              onChange({
                description: goalFormData.description.trim(),
              });
            }}
          />
        </Item>
      </Row>
    </Form>
  ) : (
    <></>
  );
}

function Item(props: {
  span: number;
  label: string;
  children: React.ReactNode;
  name: string;
}) {
  return (
    <Col span={props.span} className="w-full flex items-center !py-0">
      <Form.Item field={props.name} label={props.label}>
        {props.children}
      </Form.Item>
    </Col>
  );
}
