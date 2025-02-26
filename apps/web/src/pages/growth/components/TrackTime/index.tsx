import { Popover } from '@arco-design/web-react';
import clsx from 'clsx';
import SiteIcon from '@/components/SiteIcon';

function TrackTime(props: {
  trackTimeList: {
    duration?: number;
    startAt?: string;
    endAt?: string;
    note?: string;
  }[];
}) {
  return (
    <Popover
      trigger="click"
      content={
        <div>
          {props.trackTimeList.map((trackTime) => (
            <div key={trackTime.startAt}>
              <div>{trackTime.startAt}</div>
              <div>{trackTime.endAt}</div>
              <div>{trackTime.note}</div>
              <div>{trackTime.duration}</div>
            </div>
          ))}
        </div>
      }
    >
      <div
        className={clsx(
          'w-full h-8 px-2',
          'flex items-center rounded-sm cursor-pointer',
          'bg-fill-2 text-text-1 text-body-3',
          'hover:bg-fill-3',
        )}
      >
        <div className="flex items-center gap-1">
          <SiteIcon className="w-4 h-4 text-text-3" id={'cute-play'} />
          {props.trackTimeList.reduce((acc, trackTime) => {
            let duration = 0;
            if (trackTime.duration) {
              duration = trackTime.duration;
            } else if (trackTime.startAt && trackTime.endAt) {
              duration =
                new Date(trackTime.endAt).getTime() / 1000 -
                new Date(trackTime.startAt).getTime() / 1000;
            }
            return acc + duration;
          }, 0)}
        </div>
      </div>
    </Popover>
  );
}

export default TrackTime;
