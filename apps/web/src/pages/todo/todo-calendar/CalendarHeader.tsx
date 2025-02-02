import cs from 'classnames';
import { isArray } from 'lodash-es';
import {
  IconDoubleLeft,
  IconLeft,
  IconRight,
  IconDoubleRight,
} from '@arco-design/web-react/icon';
import { dayjs } from './utils';
import { useCalendarContext } from './context';
import { Radio, Button } from '@arco-design/web-react';
import FlexibleContainer from '@/components/FlexibleContainer';
const ButtonGroup = Button.Group;

function CalendarHeader(props: { prefixCls: string }) {
  const { prefixCls } = props;

  const {
    move,
    pageShowDate,
    changePageShowDate,
    calendarMode,
    setCalendarMode,
  } = useCalendarContext();

  return (
    <FlexibleContainer direction="vertical" className={`px-5 py-4`}>
      <FlexibleContainer.Shrink className="flex items-center">
        <div className={`${prefixCls}-header-value`}>
          {calendarMode === 'year'
            ? pageShowDate.format('YYYY年')
            : pageShowDate.format('YYYY年MM月')}
        </div>
      </FlexibleContainer.Shrink>

      <FlexibleContainer.Fixed className="flex items-center gap-4">
        <Radio.Group
          type="button"
          options={[
            {
              label: '年',
              value: 'year',
            },
            {
              label: '月',
              value: 'month',
            },
          ]}
          onChange={setCalendarMode}
          value={calendarMode}
        />
        <ButtonGroup>
          <Button
            className=""
            onClick={() => changePageShowDate('prev', calendarMode)}
          >
            {<IconLeft />}
          </Button>
          <Button
            className={`${prefixCls}-footer-btn-wrapper`}
            onClick={() => move(dayjs())}
          >
            今天
          </Button>
          <Button onClick={() => changePageShowDate('next', calendarMode)}>
            {<IconRight />}
          </Button>
        </ButtonGroup>
      </FlexibleContainer.Fixed>
    </FlexibleContainer>
  );
}

export default CalendarHeader;
