import styled from '@emotion/styled';
import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Loader } from '@/components/common/Loader';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { KpiCard } from '@/components/common/KpiCard';
import { SectionCard } from '@/components/common/SectionCard';
import { getRecommendationChartData } from '@/features/admin/dashboard/lib/dashboardChartData';
import type { RecommendationStatistics } from '@/features/admin/dashboard/types/dashboard';
import { chartColors } from '@/constants/chartColors';
import { IcDashboard } from '@/icons';

type RecommendationAdoptionPanelProps = {
  data?: RecommendationStatistics;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export const RecommendationAdoptionPanel = ({
  data,
  isLoading,
  isError,
  onRetry,
}: RecommendationAdoptionPanelProps) => {
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <SectionErrorState onRetry={onRetry} />;
  }

  if (!data) {
    return <SectionEmptyState icon={IcDashboard} />;
  }

  const chartData = getRecommendationChartData(data);

  const getBarColor = (label: string) => {
    if (label === '그대로 사용') {
      return chartColors.recommendation.usedAsIs;
    }

    if (label === '일부 수정') {
      return chartColors.recommendation.modified;
    }

    return chartColors.recommendation.notUsed;
  };

  return (
    <RecommendationAdoptionPanelContainer>
      <KpiGrid>
        <KpiCard title="수정률" value={`${data.adoptionRate.toFixed(1)}%`} />
        <KpiCard title="그대로 사용" value={`${data.totalUsedAsIs}건`} />
        <KpiCard title="일부 수정 후 사용" value={`${data.totalModified}건`} />
        <KpiCard title="미사용" value={`${data.totalNotUsed}건`} />
      </KpiGrid>

      <SectionCard title="추천 문장 사용 방식 비교">
        <RecommendationChartContainer>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 16, right: 20, left: 20, bottom: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="label"
                type="category"
                width={88}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar
                dataKey="value"
                barSize={24}
                radius={[0, 8, 8, 0]}
                shape={barProps => {
                  const fill = getBarColor(barProps.payload.label);

                  return <Rectangle {...barProps} fill={fill} radius={[0, 8, 8, 0]} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </RecommendationChartContainer>
      </SectionCard>
    </RecommendationAdoptionPanelContainer>
  );
};

const RecommendationAdoptionPanelContainer = styled.div`
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

const RecommendationChartContainer = styled.div`
  width: 100%;
  height: 180px;
`;
