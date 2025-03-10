import {
  Input,
  Button,
  Popover,
  Grid,
  DatePicker,
} from '@arco-design/web-react';
import { useTaskDetailContext } from './context';
import TrackTime from '../../../components/TrackTime';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { Select } from '@arco-design/web-react';
import {GoalService} from '../../../service';
import { useState, useEffect, useCallback } from 'react';
import { GoalItemVo } from '@life-toolkit/vo/growth';

const { Shrink, Fixed } = FlexibleContainer;
const { Row, Col } = Grid;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function TaskForm() {
  const { taskFormData, setTaskFormData, onChange } = useTaskDetailContext();

  const [goalList, setGoalList] = useState<GoalItemVo[]>([]);

  const initGoalList = useCallback(async () => {
    const res = await GoalService.getGoalList();
    setGoalList(res.list);
  }, []);

  useEffect(() => {
    initGoalList();
  }, []);

  return taskFormData ? (
    <>
      <Row gutter={[16, 16]} className="p-2">
        <Item span={24} label="任务名称">
          <Input
            value={taskFormData.name}
            placeholder="准备做什么?"
            type="primary"
            onChange={(value) => {
              setTaskFormData((prev) => ({ ...prev, name: value }));
            }}
            onBlur={() => {
              onChange({
                name: taskFormData.name.trim(),
              });
            }}
          />
        </Item>
        <Item span={24} label="目标">
          <Select
            options={goalList.map((goal) => ({
              label: goal.name,
              value: goal.id,
            }))}
            value={taskFormData.goalId}
            onChange={(value) => {
              setTaskFormData((prev) => ({ ...prev, goalId: value }));
            }}
          />
        </Item>
        <Item span={24} label="日期">
          <RangePicker
            value={taskFormData.planTimeRange}
            className="w-full rounded-md"
            allowClear
            showTime
            onChange={(time) => {
              setTaskFormData((prev) => ({
                ...prev,
                planTimeRange: [time[0], time[1]],
              }));
            }}
          />
        </Item>
        <Item span={12} label="预估时间">
          <Input
            value={taskFormData.estimateTime}
            onChange={(value) => {
              setTaskFormData((prev) => ({ ...prev, estimateTime: value }));
            }}
            onBlur={() => {
              onChange({
                estimateTime: taskFormData.estimateTime.trim(),
              });
            }}
          />
        </Item>
        <Item span={12} label="跟踪时间">
          <TrackTime trackTimeList={taskFormData.trackTimeList} />
        </Item>
        <Item span={24} label="描述">
          <TextArea
            autoSize={false}
            value={taskFormData.description}
            placeholder="描述一下"
            onChange={(value) => {
              setTaskFormData((prev) => ({
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
