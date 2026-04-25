import styled from '@emotion/styled';
import { useOutletContext } from 'react-router-dom';
import { useAdminDashboard } from '@/features/admin/dashboard/hooks/useAdminDashboard';
import { PdfReportPanel } from '@/components/admin/dashboard/PdfReportPanel';
import { RecommendationAdoptionPanel } from '@/components/admin/dashboard/RecommendationAdoptionPanel';
import { RiskDetectionPanel } from '@/components/admin/dashboard/RiskDetectionPanel';

type DashboardTab = 'recommendation' | 'risk' | 'pdf';

export const AdminDashboardPage = () => {
  const { activeTab } = useOutletContext<{ activeTab: DashboardTab }>();

  const {
    recommendationData,
    riskData,
    pdfData,
    isCurrentTabLoading,
    isCurrentTabError,
    refetchCurrentTab,
  } = useAdminDashboard();

  const isErrorState = isCurrentTabError;
  const isEmptyState =
    (activeTab === 'recommendation' && !recommendationData) ||
    (activeTab === 'risk' && !riskData) ||
    (activeTab === 'pdf' && !pdfData);

  return (
    <AdminDashboardPageContainer $isFullHeight={isErrorState || isEmptyState}>
      {activeTab === 'recommendation' && (
        <RecommendationAdoptionPanel
          data={recommendationData}
          isLoading={isCurrentTabLoading}
          isError={isCurrentTabError}
          onRetry={() => void refetchCurrentTab()}
        />
      )}

      {activeTab === 'risk' && (
        <RiskDetectionPanel
          data={riskData}
          isLoading={isCurrentTabLoading}
          isError={isCurrentTabError}
          onRetry={() => void refetchCurrentTab()}
        />
      )}

      {activeTab === 'pdf' && (
        <PdfReportPanel
          data={pdfData}
          isLoading={isCurrentTabLoading}
          isError={isCurrentTabError}
          onRetry={() => void refetchCurrentTab()}
        />
      )}
    </AdminDashboardPageContainer>
  );
};

const AdminDashboardPageContainer = styled.div<{ $isFullHeight: boolean }>`
  ${({ $isFullHeight }) =>
    $isFullHeight &&
    `
      height: 100%;
      display: flex;
    `}
  padding: 24px 16px;
`;
