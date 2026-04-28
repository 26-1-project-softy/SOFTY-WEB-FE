import styled from '@emotion/styled';
import { ModelPerformanceSection } from '@/components/admin/aiModel/ModelPerformanceSection';
import { ModelInfoSection } from '@/components/admin/aiModel/ModelInfoSection';

export const AdminAiModelPage = () => {
  return (
    <AiModelPageContainer title="AI 모델 관리 페이지">
      <ModelInfoSection />
      <ModelPerformanceSection />
    </AiModelPageContainer>
  );
};

const AiModelPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 24px;
`;
