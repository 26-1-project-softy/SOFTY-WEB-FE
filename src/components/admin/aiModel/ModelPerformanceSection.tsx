import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
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
        <SectionCardContent>
          <Alert title="성능 평가를 불러오지 못했어요" description="잠시 후 다시 시도해주세요." />
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (!evaluation && !isInProgress) {
    return (
      <SectionCard title="성능 평가" headerAction={headerAction}>
        <SectionCardContent>
          <SectionEmptyState
            icon={IcDashboard}
            title="성능 평가 데이터가 없어요"
            description="평가를 먼저 진행해주세요."
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  const chartData = evaluation ? getPerformanceChartData(evaluation) : [];

  return (
    <SectionCard title="성능 평가" headerAction={headerAction}>
      <SectionCardContent>
        {isInProgress && (
          <Alert
            variant="success"
            title="성능 평가를 진행 중이에요"
            description="평가가 완료되면 최신 성능 지표를 확인할 수 있어요."
          />
        )}

        {rerunError && !isInProgress && (
          <Alert title="성능 평가를 시작하지 못했어요" description="잠시 후 다시 시도해주세요." />
        )}
      </SectionCardContent>

      {evaluation && (
        <>
          <SectionCardContent>
            <KpiGrid>
              <KpiCard title="Precision" value={(evaluation.precision * 100).toFixed(2) + '%'} />
              <KpiCard title="Recall" value={(evaluation.recall * 100).toFixed(2) + '%'} />
              <KpiCard title="F1-score" value={(evaluation.f1Score * 100).toFixed(2) + '%'} />
            </KpiGrid>
          </SectionCardContent>

          <SectionCardContent>
            <PerformanceChart data={chartData} />
          </SectionCardContent>
        </>
      )}
    </SectionCard>
  );
};

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;
