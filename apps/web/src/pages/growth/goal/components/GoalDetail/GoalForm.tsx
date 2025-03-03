import { Input, Grid, DatePicker, Select, Form } from '@arco-design/web-react';
import { useGoalDetailContext } from './context';
import { GoalType } from '@life-toolkit/vo/growth';

const { Row, Col } = Grid;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function GoalForm() {
  const { goalFormData, setGoalFormData, onChange } = useGoalDetailContext();

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
          <Select
            allowClear
            placeholder="请选择目标类型"
            options={[
              {
                label: '战略规划',
                value: GoalType.OBJECTIVE,
              },
              {
                label: '成果指标',
                value: GoalType.KEY_RESULT,
              },
            ]}
            onBlur={() => {
              onChange({
                type: goalFormData.type,
              });
            }}
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
    <Col span={props.span} className="w-full flex items-center">
      <Form.Item field={props.name} label={props.label}>
        {props.children}
      </Form.Item>
    </Col>
  );
}
