import {
  Input,
  Button,
  Popover,
  Grid,
  DatePicker,
  Select,
} from '@arco-design/web-react';
import { useGoalDetailContext } from './context';
import { GoalType } from '@life-toolkit/vo/goal';
import FlexibleContainer from '@/components/FlexibleContainer';

const { Shrink, Fixed } = FlexibleContainer;
const { Row, Col } = Grid;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function GoalForm() {
  const { goalFormData, setGoalFormData, onChange } = useGoalDetailContext();

  return goalFormData ? (
    <>
      <Row gutter={[16, 16]} className="p-2">
        <Item span={24} label="目标名称">
          <Input
            value={goalFormData.name}
            placeholder="准备做什么?"
            type="primary"
            onChange={(value) => {
              setGoalFormData((prev) => ({ ...prev, name: value }));
            }}
            onBlur={() => {
              onChange({
                name: goalFormData.name.trim(),
              });
            }}
          />
        </Item>
        <Item span={24} label="日期">
          <RangePicker
            value={goalFormData.planTimeRange}
            className="w-full rounded-md"
            allowClear
            showTime
            onChange={(time) => {
              setGoalFormData((prev) => ({
                ...prev,
                planTimeRange: [time[0], time[1]],
              }));
            }}
          />
        </Item>
        <Item span={24} label="目标类型">
          <Select
            value={goalFormData.type}
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
            onChange={(value) => {
              setGoalFormData((prev) => ({ ...prev, type: value }));
            }}
          ></Select>
        </Item>
        <Item span={24} label="描述">
          <TextArea
            autoSize={false}
            value={goalFormData.description}
            placeholder="描述一下"
            onChange={(value) => {
              setGoalFormData((prev) => ({
                ...prev,
                description: value,
              }));
            }}
          />
        </Item>
      </Row>
    </>
  ) : (
    <></>
  );
}

function Item(props: {
  span: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Col span={props.span} className="flex items-center">
      <FlexibleContainer direction="vertical">
        <Fixed className="leading-[32px] w-24">{props.label}</Fixed>
        <Shrink>{props.children}</Shrink>
      </FlexibleContainer>
    </Col>
  );
}
