import styled from '@emotion/styled';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';

const MODEL_INFO_MOCK = {
  category: 'LLM 모델',
  modelName: 'ChatGPT-4o',
  version: 'v1.0.3',
  lastTrainedAt: '2026-04-25 01:00:00',
  lastDeployedAt: '2026-04-25 01:00:00',
  dataset: 'dataset-v5',
} as const;

export const ModelInfoSection = () => {
  return (
    <SectionCard title="모델 정보">
      <SectionCardContent>
        <ModelInfoContainer>
          <ModelCategory>{MODEL_INFO_MOCK.category}</ModelCategory>

          <ModelInfoGrid>
            <ModelInfoField>
              <ModelInfoLabel>모델명</ModelInfoLabel>
              <ModelInfoValue>{MODEL_INFO_MOCK.modelName}</ModelInfoValue>
            </ModelInfoField>

            <ModelInfoField>
              <ModelInfoLabel>버전</ModelInfoLabel>
              <ModelInfoValue>{MODEL_INFO_MOCK.version}</ModelInfoValue>
            </ModelInfoField>

            <ModelInfoField>
              <ModelInfoLabel>마지막 학습</ModelInfoLabel>
              <ModelInfoValue>{MODEL_INFO_MOCK.lastTrainedAt}</ModelInfoValue>
            </ModelInfoField>

            <ModelInfoField>
              <ModelInfoLabel>마지막 배포</ModelInfoLabel>
              <ModelInfoValue>{MODEL_INFO_MOCK.lastDeployedAt}</ModelInfoValue>
            </ModelInfoField>

            <ModelInfoField>
              <ModelInfoLabel>데이터셋</ModelInfoLabel>
              <ModelInfoValue>{MODEL_INFO_MOCK.dataset}</ModelInfoValue>
            </ModelInfoField>
          </ModelInfoGrid>
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
