import styled from '@emotion/styled';
import { SectionCard } from '@/components/common/SectionCard';
import { KpiCard } from '@/components/common/KpiCard';
import { PerformanceChart } from './PerformanceChart';
import { getPerformanceChartData } from '@/features/admin/aiModel/lib/performanceChartData';
import { useModelEvaluation } from '@/features/admin/aiModel/hooks/useModelEvaluation';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { IcDashboard } from '@/icons';

export const ModelPerformanceSection = () => {
  const { evaluation, isInProgress, isLoading, isError, onRerun, isRerunning, rerunError } =
    useModelEvaluation();

  const headerAction = (
    <InlineButton
      variant="primary"
      size="M"
      label="다시 평가"
      onClick={onRerun}
      disabled={isRerunning}
    />
  );

  if (isLoading) return <Loader />;

  if (isError && !evaluation) {
    return (
      <SectionCard title="성능 평가" headerAction={headerAction}>
        <ContentContainer>
          <Alert title="성능 평가를 불러오지 못했어요" description="잠시 후 다시 시도해주세요." />
        </ContentContainer>
      </SectionCard>
    );
  }

  if (!evaluation && !isInProgress) {
    return (
      <SectionCard title="성능 평가" headerAction={headerAction}>
        <ContentContainer>
          <SectionEmptyState
            icon={IcDashboard}
            title="성능 평가 데이터가 없어요"
            description="평가를 먼저 진행해주세요."
          />
        </ContentContainer>
      </SectionCard>
    );
  }

  const chartData = evaluation ? getPerformanceChartData(evaluation) : [];

  return (
    <SectionCard title="성능 평가" headerAction={headerAction}>
      {isInProgress && (
        <ContentContainer>
          <Alert
            variant="success"
            title="성능 평가를 진행 중이에요"
            description="평가가 완료되면 최신 성능 지표를 확인할 수 있어요."
          />
        </ContentContainer>
      )}

      {rerunError && !isInProgress && (
        <ContentContainer>
          <Alert title="성능 평가를 시작하지 못했어요" description="잠시 후 다시 시도해주세요." />
        </ContentContainer>
      )}

      {evaluation && (
        <>
          <KpiGrid>
            <KpiCard title="Precision" value={(evaluation.precision * 100).toFixed(2) + '%'} />
            <KpiCard title="Recall" value={(evaluation.recall * 100).toFixed(2) + '%'} />
            <KpiCard title="F1-score" value={(evaluation.f1Score * 100).toFixed(2) + '%'} />
          </KpiGrid>

          <ChartWrapper>
            <PerformanceChart data={chartData} />
          </ChartWrapper>
        </>
      )}
    </SectionCard>
  );
};

const ContentContainer = styled.div`
  padding: 16px 20px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 20px 16px;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 240px;
`;
