import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { Alert } from '@/components/common/Alert';
import { useLatestModelInfo } from '@/features/admin/aiModel/hooks/useLatestModelInfo';
import { Loader } from '@/components/common/Loader';
import { formatAiModelDateTime } from '@/utils/formatDateTime';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { IcDashboard } from '@/icons';

const MODEL_CATEGORY_LABEL = 'LLM 모델';

export const ModelInfoSection = () => {
  const { modelInfo, isLoading, isError, errorMessage } = useLatestModelInfo();

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (isError) {
      return (
        <Alert
          title="모델 정보를 불러오지 못했어요"
          description={errorMessage || '잠시 후 다시 시도해주세요.'}
        />
      );
    }

    if (!modelInfo) {
      return (
        <SectionEmptyState
          icon={IcDashboard}
          title="모델 정보가 없어요"
          description="최신 학습 작업 정보가 아직 없어요."
        />
      );
    }

    const modelInfoFields = [
      {
        label: '모델명',
        value: modelInfo.modelName || '-',
      },
      {
        label: '버전',
        value: modelInfo.modelVersion || '-',
      },
      {
        label: '데이터셋',
        value: modelInfo.datasetVersion || '-',
      },
      {
        label: '상태',
        value: modelInfo.status || '-',
      },
      {
        label: '마지막 학습',
        value: formatAiModelDateTime(modelInfo.lastTrainedAt),
      },
    ];

    return (
      <ModelInfoContainer>
        <ModelCategory>{MODEL_CATEGORY_LABEL}</ModelCategory>

        <ModelInfoGrid>
          {modelInfoFields.map(field => (
            <ModelInfoField key={field.label}>
              <ModelInfoLabel>{field.label}</ModelInfoLabel>
              <ModelInfoValue title={field.value}>{field.value}</ModelInfoValue>
            </ModelInfoField>
          ))}
        </ModelInfoGrid>
      </ModelInfoContainer>
    );
  };

  return (
    <SectionCard title="모델 정보">
      <SectionCardContent>{renderContent()}</SectionCardContent>
    </SectionCard>
  );
};

const ModelInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ModelCategory = styled.h3`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ModelInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 393px) {
    grid-template-columns: 1fr;
  }
`;

const ModelInfoField = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 0 12px;
  gap: 10px;
`;

const ModelInfoLabel = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ModelInfoValue = styled.p`
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.labelS};
  }
`;
