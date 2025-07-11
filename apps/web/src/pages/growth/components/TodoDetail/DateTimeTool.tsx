import { Popover, Calendar, Select, TimePicker } from '@arco-design/web-react';
import { IconLeft, IconRight } from '@arco-design/web-react/icon';
import dayjs, { Dayjs } from 'dayjs';
import { SiteIcon } from '@life-toolkit/components-web-ui';
import { useState } from 'react';
import 'dayjs/locale/zh-cn';
import { RepeatSelector } from '@life-toolkit/components-repeat/web';
import { GlobalContext } from '@/context';
import { useContext } from 'react';
import clsx from 'clsx';
import {
  RepeatModeForm,
  RepeatEndModeForm,
} from '@life-toolkit/components-repeat/types';

const { RangePicker } = TimePicker;

dayjs.locale('zh-cn');
const today = dayjs().format('YYYY-MM-DD');

const getFormattedDate = (date) => {
  const diff = date.diff(today, 'days'); // 计算两个日期的差异

  if (diff === 0) {
    return '今天'; // 如果是今天
  }
  if (diff === -1) {
    return '昨天'; // 如果是昨天
  }
  if (diff === 1) {
    return '明天'; // 如果是明天
  }
  if (diff > 1 && diff < 7) {
    return date.format('ddd'); // 如果是接下来的一周，显示周几
  }
  return date.format('YYYY-MM-DD'); // 如果大于7天，显示完整日期
};

export default function DateTimeTool(props: {
  formData: {
    date: Dayjs;
    timeRange: [string | undefined, string | undefined];
    repeat: (RepeatModeForm & RepeatEndModeForm) | undefined;
  };
  onChangeData: (formData: {
    date: Dayjs;
    timeRange: [string | undefined, string | undefined];
    repeat: (RepeatModeForm & RepeatEndModeForm) | undefined;
  }) => void;
}) {
  const { lang } = useContext(GlobalContext);
  const { formData, onChangeData } = props;
  const [mode, setMode] = useState<'month' | 'year'>('month');
  return (
    <Popover
      trigger="click"
      content={
        <div className={clsx('py-3 w-72', 'flex flex-col gap-4')}>
          <div className="w-full flex justify-center">
            <Calendar
              panel
              panelWidth={'100%'}
              value={formData.date}
              defaultValue={dayjs()}
              className="w-full !border-none"
              onChange={(date) => {
                if (mode === 'year') {
                  setMode('month');
                } else {
                  onChangeData({
                    ...formData,
                    date: date,
                  });
                }
              }}
              mode={mode}
              headerRender={({
                value,
                pageShowDate,
                onChange,
                onChangePageDate,
                onChangeMode,
              }) => (
                <div className="text-body-3 px-5 flex items-center justify-between">
                  <div
                    onClick={() => {
                      setMode('year');
                      onChangeMode('year');
                    }}
                    className="cursor-pointer px-2"
                  >
                    {pageShowDate?.format(
                      mode === 'year' ? 'YYYY年' : 'YYYY年MM月',
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconLeft
                      className="!text-text-3 cursor-pointer"
                      onClick={() => {
                        if (mode === 'year') {
                          onChangePageDate(pageShowDate?.subtract(1, 'year'));
                        } else {
                          onChangePageDate(pageShowDate?.subtract(1, 'month'));
                        }
                      }}
                    />
                    <a
                      className="h-5 text-text-3 text-body-2 relative group cursor-pointer"
                      onClick={() => onChangePageDate(value)}
                    >
                      今天
                    </a>
                    <IconRight
                      className="!text-text-3 cursor-pointer"
                      onClick={() => {
                        if (mode === 'year') {
                          onChangePageDate(pageShowDate?.add(1, 'year'));
                        } else {
                          onChangePageDate(pageShowDate?.add(1, 'month'));
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            />
          </div>
          <div className="px-3">
            <RangePicker
              value={formData.timeRange}
              className="w-full rounded-md"
              format="HH:mm"
              step={{ minute: 5 }}
              disableConfirm
              allowClear
              onChange={(time) => {
                onChangeData({
                  ...formData,
                  timeRange: [time[0], time[1]],
                });
              }}
            />
          </div>
          <div className="px-3">
            <RepeatSelector
              lang={lang as 'en-US' | 'zh-CN'}
              value={formData.repeat}
              onChange={(value) => {
                onChangeData({ ...formData, repeat: value });
              }}
            />
          </div>
        </div>
      }
    >
      <div className="px-1.5 h-7 rounded-sm hover:bg-fill-3 flex items-center gap-2 cursor-pointer">
        <SiteIcon
          width={16}
          height={16}
          id={`today-icon-${formData.date.format('D')}`}
        />
        {getFormattedDate(formData.date)}
      </div>
    </Popover>
  );
}
