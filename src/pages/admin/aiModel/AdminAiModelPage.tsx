import styled from '@emotion/styled';
import { ModelInfoSection } from '@/components/admin/aiModel/ModelInfoSection';
import { ModelPerformanceSection } from '@/components/admin/aiModel/ModelPerformanceSection';
import { ModelRetrainingSection } from '@/components/admin/aiModel/ModelRetrainingSection';
import { ModelTrainingHistorySection } from '@/components/admin/aiModel/ModelTrainingHistorySection';

export const AdminAiModelPage = () => {
  return (
    <AiModelPageContainer title="AI 모델 관리 페이지">
      <ModelInfoSection />
      <ModelPerformanceSection />
      <ModelRetrainingSection />
      <ModelTrainingHistorySection />
    </AiModelPageContainer>
  );
};

const AiModelPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 24px;
`;
