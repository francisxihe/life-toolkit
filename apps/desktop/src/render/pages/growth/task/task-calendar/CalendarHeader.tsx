
import dayjs, { type Dayjs } from 'dayjs';
import { Button, Space, Flex, LeftOutlined, RightOutlined } from '@sue/design-web-react';

type CalendarHeaderProps = {
  value: Dayjs;
  onChange: (date: Dayjs) => void;
};

function CalendarHeader(props: CalendarHeaderProps) {
  const { value, onChange } = props;

  return (
    <Flex container="fixed" className="w-full px-5 py-4">
      <Flex container="fill" className="flex items-center">
        <div className="text-body-1 text-text-1 font-medium">
          {value.format('YYYY年MM月')}
        </div>
      </Flex>

      <Flex container="fixed" className="h-full flex items-center">
        <Space.Compact>
          <Button
            className=""
            onClick={() => onChange(value.subtract(1, 'month'))}
          >
            {<LeftOutlined />}
          </Button>
          <Button
            onClick={() => onChange(dayjs())}
          >
            今天
          </Button>
          <Button onClick={() => onChange(value.add(1, 'month'))}>
            {<RightOutlined />}
          </Button>
        </Space.Compact>
      </Flex>
    </Flex>
  );
}

export default CalendarHeader;
