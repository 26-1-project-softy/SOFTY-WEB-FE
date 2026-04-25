import styled from '@emotion/styled';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Loader } from '@/components/common/Loader';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { KpiCard } from '@/components/common/KpiCard';
import { SectionCard } from '@/components/common/SectionCard';
import { getRiskChartData } from '@/features/admin/dashboard/lib/dashboardChartData';
import type { RiskStatistics } from '@/features/admin/dashboard/types/dashboard';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { chartColors } from '@/constants/chartColors';
import { IcDashboard } from '@/icons';

type RiskDetectionPanelProps = {
  data?: RiskStatistics;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export const RiskDetectionPanel = ({
  data,
  isLoading,
  isError,
  onRetry,
}: RiskDetectionPanelProps) => {
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <SectionErrorState onRetry={onRetry} />;
  }

  if (!data) {
    return <SectionEmptyState icon={IcDashboard} />;
  }

  const chartData = getRiskChartData(data);

  return (
    <RiskDetectionPanelContainer>
      <KpiGrid>
        <KpiCard title="총 메시지 수" value={`${data.totalMessageCount.toLocaleString()}건`} />
        <KpiCard
          title="탐지된 분쟁 메시지"
          value={`${data.detectedConflictCount.toLocaleString()}건`}
        />
        <KpiCard title="분쟁 리스크 탐지율" value={`${data.conflictDetectionRate.toFixed(1)}%`} />
      </KpiGrid>

      <SectionCard title="총 메시지 대비 분쟁 탐지 비율">
        <RiskChartContainer>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 16, right: 20, left: 20, bottom: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} allowDecimals={false} hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                formatter={(value: ValueType | undefined) => `${Number(value).toFixed(1)}%`}
              />
              <Legend formatter={value => <LegendLabel>{value}</LegendLabel>} />
              <Bar
                dataKey="safeRate"
                stackId="risk"
                name="리스크 낮음"
                barSize={24}
                fill={chartColors.riskDetection.low}
                radius={[8, 0, 0, 8]}
              />
              <Bar
                dataKey="detectedConflictRate"
                stackId="risk"
                name="리스크 높음"
                barSize={24}
                fill={chartColors.riskDetection.high}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </RiskChartContainer>
      </SectionCard>
    </RiskDetectionPanelContainer>
  );
};

const RiskDetectionPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1140px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RiskChartContainer = styled.div`
  width: 100%;
  height: 120px;
`;

const LegendLabel = styled.span`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text3};
`;
