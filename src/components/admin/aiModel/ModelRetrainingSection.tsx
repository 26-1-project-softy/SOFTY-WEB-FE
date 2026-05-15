import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { InfoFieldGrid } from '@/components/admin/aiModel/InfoFieldGrid';
import { useModelRetraining } from '@/features/admin/aiModel/hooks/useModelRetraining';
import { formatDateTime } from '@/utils/formatDateTime';
import { IcDashboard, IcRefresh } from '@/icons';

type RetrainingStatusAlertProps = {
  isRetrainingInProgress: boolean;
  isRetrainingFailed: boolean;
  isPerformanceDegraded: boolean;
  retrainError: boolean;
};

const RetrainingStatusAlert = ({
  isRetrainingInProgress,
  isRetrainingFailed,
  isPerformanceDegraded,
  retrainError,
}: RetrainingStatusAlertProps) => {
  if (isRetrainingInProgress) {
    return (
      <Alert
        variant="success"
        title="모델 재학습을 진행 중이에요"
        description="재학습이 완료되면 최신 모델 정보와 성능 평가가 갱신돼요."
      />
    );
  }

  if (isRetrainingFailed) {
    return (
      <Alert
        title="모델 재학습에 실패했어요"
        description="문제를 확인한 뒤 재학습을 다시 실행해주세요."
      />
    );
  }

  if (retrainError) {
    return <Alert title="재학습을 시작하지 못했어요" description="잠시 후 다시 시도해주세요." />;
  }

  if (isPerformanceDegraded) {
    return (
      <Alert
        variant="warning"
        title="성능 저하가 감지되었어요"
        description="F1-score가 0.7 이하로 내려갔어요. 최신 데이터셋으로 재학습을 진행해주세요."
      />
    );
  }

  return null;
};

export const ModelRetrainingSection = () => {
  const {
    latestModelInfo,
    isLoading,
    isError,
    isRetraining,
    isRetrainingInProgress,
    isRetrainingFailed,
    isPerformanceDegraded,
    retrainError,
    handleRetrain,
  } = useModelRetraining();

  const headerAction = (
    <InlineButton
      variant="primary"
      size="M"
      icon={IcRefresh}
      label="재학습 실행"
      onClick={handleRetrain}
      disabled={isRetraining}
    />
  );

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <SectionCard
        title="재학습"
        description="최신 데이터셋으로 모델을 재학습할 수 있어요."
        headerAction={headerAction}
      >
        <SectionCardContent>
          <Alert title="재학습 정보를 불러오지 못했어요" description="잠시 후 다시 시도해주세요." />
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (!latestModelInfo) {
    return (
      <SectionCard
        title="재학습"
        description="최신 데이터셋으로 모델을 재학습할 수 있어요."
        headerAction={headerAction}
      >
        <SectionCardContent>
          <SectionEmptyState
            icon={IcDashboard}
            title="재학습할 모델 정보가 없어요"
            description="최신 모델 정보가 생성된 후 다시 시도해주세요."
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  const retrainingInfoFields = [
    {
      label: '현재 데이터셋',
      value: latestModelInfo.datasetVersion || '-',
    },
    {
      label: '현재 상태',
      value: latestModelInfo.status || '-',
    },
    {
      label: '마지막 학습',
      value: formatDateTime(latestModelInfo.lastTrainedAt),
    },
  ];

  return (
    <SectionCard
      title="재학습"
      description="최신 데이터셋으로 모델을 재학습할 수 있어요."
      headerAction={headerAction}
    >
      <SectionCardContent>
        <RetrainingContainer>
          <RetrainingStatusAlert
            isRetrainingInProgress={isRetrainingInProgress}
            isRetrainingFailed={isRetrainingFailed}
            isPerformanceDegraded={isPerformanceDegraded}
            retrainError={retrainError}
          />

          <InfoFieldGrid fields={retrainingInfoFields} />
        </RetrainingContainer>
      </SectionCardContent>
    </SectionCard>
  );
};

const RetrainingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
