'use client';

import { Typography, Spin } from '@arco-design/web-react';
import { Chart, Line, Axis, Tooltip, Legend } from 'bizcharts';
import CustomTooltip from '@/components/Chart/customer-tooltip';

const { Title } = Typography;

interface TodoChartProps {
  data: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
  loading?: boolean;
}

export function TodoChart({ data, loading }: TodoChartProps) {
  // 转换数据格式以适配图表
  const chartData = data.flatMap((item) => [
    {
      date: item.date,
      value: item.completed,
      type: '已完成',
    },
    {
      date: item.date,
      value: item.created,
      type: '新创建',
    },
  ]);

  return (
    <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-primary-light-1 rounded-lg flex items-center justify-center mr-3">
          <div className="w-5 h-5 bg-primary rounded"></div>
        </div>
        <div>
          <Title heading={5} className="!mb-0">
            任务趋势
          </Title>
          <div className="text-sm text-text-3">最近7天的任务创建和完成情况</div>
        </div>
      </div>

      <div className="h-80">
        <Spin loading={loading} style={{ width: '100%', height: '100%' }}>
          <Chart
            height={300}
            data={chartData}
            autoFit
            padding={[20, 20, 50, 50]}
            className="chart-wrapper"
          >
            <Line
              position="date*value"
              color={['type', ['#10b981', '#3b82f6']]}
              shape="smooth"
              size={2}
            />
            <Axis
              name="value"
              label={{
                formatter: (text: string) => `${text}个`,
              }}
            />
            <Axis name="date" />
            <Tooltip shared>
              {(title, items) => {
                return <CustomTooltip title={title} data={items} />;
              }}
            </Tooltip>
            <Legend position="top" marker={{ symbol: 'circle' }} />
          </Chart>
        </Spin>
      </div>
    </div>
  );
}
