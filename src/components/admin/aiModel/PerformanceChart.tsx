import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartColors } from '@/constants/chartColors';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from '@emotion/styled';

type Props = {
  data: { label: string; value: number }[];
};

export const PerformanceChart = ({ data }: Props) => {
  const getBarColor = (label: string) => {
    if (label === 'Precision') return chartColors.performEvaluation.precision;
    if (label === 'Recall') return chartColors.performEvaluation.recall;
    return chartColors.performEvaluation.f1Score;
  };

  return (
    <PerformanceChartContainer>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 16, right: 20, left: 20, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 1]} width={32} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: ValueType | undefined) => `${Number(value).toFixed(2)}`} />
          <Bar
            dataKey="value"
            barSize={48}
            radius={[8, 8, 0, 0]}
            shape={barProps => {
              const fill = getBarColor(barProps.payload.label);
              return <Rectangle {...barProps} fill={fill} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </PerformanceChartContainer>
  );
};

const PerformanceChartContainer = styled.div`
  width: 100%;
  height: 240px;

  .recharts-wrapper *:focus {
    outline: none;
  }
`;
