'use client';

import { Card, Typography, Spin } from '@arco-design/web-react';
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
  const chartData = data.flatMap(item => [
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
    <Card title="任务趋势" style={{ height: 400 }}>
      <Spin loading={loading} style={{ width: '100%' }}>
        <Chart
          height={300}
          data={chartData}
          autoFit
          padding={[20, 20, 50, 50]}
          className="chart-wrapper"
        >
          <Line
            position="date*value"
            color={['type', ['#00b42a', '#165dff']]}
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
          <Legend 
            position="top"
            marker={{ symbol: 'circle' }}
          />
        </Chart>
      </Spin>
    </Card>
  );
} 