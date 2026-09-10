
import dayjs, { type Dayjs } from 'dayjs';
import { Button, Space, Flex } from '@sue/design-web-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
            {<ChevronLeft size={16} />}
          </Button>
          <Button
            onClick={() => onChange(dayjs())}
          >
            今天
          </Button>
          <Button onClick={() => onChange(value.add(1, 'month'))}>
            {<ChevronRight size={16} />}
          </Button>
        </Space.Compact>
      </Flex>
    </Flex>
  );
}

export default CalendarHeader;
