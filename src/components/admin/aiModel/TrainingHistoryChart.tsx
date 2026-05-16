import { useTheme } from '@emotion/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrainingHistoryItem } from '@/services/admin/aiModelApi';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';

type TrainingHistoryChartProps = {
  data: TrainingHistoryItem[];
};

export const TrainingHistoryChart = ({ data }: TrainingHistoryChartProps) => {
  const theme = useTheme();

  const chartData = [...data].reverse().map((item, index) => ({
    chartId: `${item.version}-${item.trainedAt}-${index}`,
    version: item.version,
    f1Score: item.f1Score,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 24, right: 20, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="f1ScoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.brand.primary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={theme.colors.brand.primary} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="chartId"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(_, index) => chartData[index]?.version ?? ''}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          formatter={(value: ValueType | undefined) => [Number(value).toFixed(2), 'F1-score']}
        />
        <Area
          type="monotone"
          dataKey="f1Score"
          stroke={theme.colors.brand.primary}
          fill="url(#f1ScoreGradient)"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: theme.colors.brand.primary,
            fillOpacity: 1,
            stroke: theme.colors.brand.primary,
          }}
          activeDot={{
            r: 5,
            fill: theme.colors.brand.primary,
            fillOpacity: 1,
            stroke: theme.colors.brand.primary,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
