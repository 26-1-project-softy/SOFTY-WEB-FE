import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { Alert } from '@/components/common/Alert';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { InfoFieldGrid } from '@/components/admin/aiModel/InfoFieldGrid';
import { useLatestModelInfo } from '@/features/admin/aiModel/hooks/useLatestModelInfo';
import { formatDateTime } from '@/utils/formatDateTime';
import { IcDashboard } from '@/icons';

const MODEL_CATEGORY_LABEL = 'LLM 모델';

export const ModelInfoSection = () => {
  const { modelInfo, isLoading, isError, errorMessage } = useLatestModelInfo();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <SectionCard title="모델 정보">
        <SectionCardContent>
          <Alert
            title="모델 정보를 불러오지 못했어요"
            description={errorMessage || '잠시 후 다시 시도해주세요.'}
          />
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (!modelInfo) {
    return (
      <SectionCard title="모델 정보">
        <SectionCardContent>
          <SectionEmptyState
            icon={IcDashboard}
            title="모델 정보가 없어요"
            description="최신 학습 작업 정보가 아직 없어요."
          />
        </SectionCardContent>
      </SectionCard>
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
      value: formatDateTime(modelInfo.lastTrainedAt),
    },
  ];

  return (
    <SectionCard title="모델 정보">
      <SectionCardContent>
        <ModelInfoContainer>
          <ModelCategory>{MODEL_CATEGORY_LABEL}</ModelCategory>

          <InfoFieldGrid fields={modelInfoFields} />
        </ModelInfoContainer>
      </SectionCardContent>
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
