import {
  Input,
  Button,
  Popover,
  Grid,
  DatePicker,
  Switch,
  Spin,
} from '@arco-design/web-react';
import { useTaskDetailContext } from './context';
import TrackTime from '../TrackTime';
import { Select, Form } from '@arco-design/web-react';
import { useComponentLoad } from '@/hooks/lifecycle';
const { Row, Col } = Grid;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

export default function TaskForm() {
  const {
    loading,
    goalList,
    currentTask,
    taskList,
    taskFormData,
    setTaskFormData,
  } = useTaskDetailContext();

  const [form] = Form.useForm();

  const { handleComponentLoaded } = useComponentLoad(async () => {
    if (currentTask?.id) {
      form.setFieldsValue(taskFormData);
      handleComponentLoaded();
    }
  });

  if (loading) {
    return <Spin dot />;
  }
  if (!taskFormData) return null;
  return (
    <Form
      form={form}
      initialValues={taskFormData}
      onValuesChange={(changedValues) => {
        setTaskFormData((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      <Row gutter={[16, 16]} className="p-2">
        <Item span={24} label="任务名称" name="name">
          <Input placeholder="准备做什么?" />
        </Item>
        <Item span={24} label="是否子任务" name="isSubTask">
          <Switch checked={taskFormData.isSubTask} />
        </Item>
        {taskFormData.isSubTask ? (
          <Item span={24} label="父任务" name="parentId">
            <Select
              options={taskList.map((task) => ({
                label: task.name,
                value: task.id,
              }))}
            />
          </Item>
        ) : (
          <Item span={24} label="目标" name="goalId">
            <Select
              options={goalList.map((goal) => ({
                label: goal.name,
                value: goal.id,
              }))}
            />
          </Item>
        )}
        <Item span={24} label="日期" name="planTimeRange">
          <RangePicker className="w-full rounded-md" allowClear showTime />
        </Item>
        <Item span={12} label="预估时间" name="estimateTime">
          <Input />
        </Item>
        <Item span={12} label="跟踪时间" name="trackTimeList">
          <TrackTime trackTimeList={taskFormData.trackTimeList} />
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
  const { size } = useTaskDetailContext();
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
