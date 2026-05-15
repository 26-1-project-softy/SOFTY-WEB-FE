import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { KpiCard } from '@/components/common/KpiCard';
import { PerformanceChart } from './PerformanceChart';
import { getPerformanceChartData } from '@/features/admin/aiModel/lib/performanceChartData';
import { useModelEvaluation } from '@/features/admin/aiModel/hooks/useModelEvaluation';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { ProgressBar } from '@/components/admin/aiModel/ProgressBar';
import { IcDashboard } from '@/icons';

const PROGRESS_VISIBLE_DELAY = 700;

export const ModelPerformanceSection = () => {
  const {
    evaluation,
    progressPercent,
    isInProgress,
    isCompleted,
    isFailed,
    isLoading,
    isError,
    onRerun,
    isRerunning,
    rerunError,
  } = useModelEvaluation();

  const [shouldShowProgress, setShouldShowProgress] = useState(false);

  const isProgressPending = isRerunning || isInProgress;
  const chartData = isCompleted && evaluation ? getPerformanceChartData(evaluation) : [];

  useEffect(() => {
    if (!isProgressPending) {
      const timerId = window.setTimeout(() => {
        setShouldShowProgress(false);
      }, 0);
      return () => window.clearTimeout(timerId);
    }

    const timerId = window.setTimeout(() => {
      setShouldShowProgress(true);
    }, PROGRESS_VISIBLE_DELAY);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isProgressPending]);

  const headerAction = (
    <InlineButton
      variant="primary"
      size="M"
      label="다시 평가"
      onClick={onRerun}
      disabled={isRerunning}
    />
  );

  if (isLoading) {
    return <Loader />;
  }

  if (isError && !evaluation) {
    return (
      <SectionCard title="성능 평가" headerAction={headerAction}>
        <SectionCardContent>
          <Alert title="성능 평가를 불러오지 못했어요" description="잠시 후 다시 시도해주세요." />
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (!evaluation && !isProgressPending && !isFailed) {
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

  return (
    <SectionCard title="성능 평가" headerAction={headerAction}>
      {(shouldShowProgress || isFailed || (rerunError && !isProgressPending)) && (
        <SectionCardContent>
          <StatusContainer>
            {shouldShowProgress && (
              <ProgressContainer>
                <Alert
                  variant="success"
                  title="성능 평가를 진행 중이에요"
                  description="평가가 완료되면 최신 성능 지표를 확인할 수 있어요."
                />
                <ProgressBar label="진행률" value={progressPercent} />
              </ProgressContainer>
            )}

            {isFailed && !isProgressPending && (
              <Alert
                title="성능 평가에 실패했어요"
                description="평가를 다시 실행하거나 잠시 후 다시 시도해주세요."
              />
            )}

            {rerunError && !isProgressPending && (
              <Alert
                title="성능 평가를 시작하지 못했어요"
                description="잠시 후 다시 시도해주세요."
              />
            )}
          </StatusContainer>
        </SectionCardContent>
      )}

      {isCompleted && evaluation && (
        <>
          <SectionCardContent>
            <KpiGrid>
              <KpiCard title="Precision" value={`${(evaluation.precision * 100).toFixed(2)}%`} />
              <KpiCard title="Recall" value={`${(evaluation.recall * 100).toFixed(2)}%`} />
              <KpiCard title="F1-score" value={`${(evaluation.f1Score * 100).toFixed(2)}%`} />
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

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

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
