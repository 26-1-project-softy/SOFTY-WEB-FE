import styled from '@emotion/styled';
import { useTeacherReports } from '@/features/teacher/reports/hooks/useTeacherReports';
import { HEADER_HEIGHT } from '@/constants/layout';
import { ReportRoomListSection } from '@/components/teacher/reports/ReportRoomListSection';
import { ReportPreviewSection } from '@/components/teacher/reports/ReportPreviewSection';
import { ReportCompleteDialog } from '@/components/teacher/reports/ReportCompleteDialog';

export const TeacherReportsPage = () => {
  const {
    reportItems,
    selectedReport,
    selectedReportId,
    isLoading,
    hasListError,
    hasNoData,
    listErrorDisplayMessage,
    isPreviewLoadError,
    isPreviewLoading,
    isPreviewLoadingMore,
    previewMessages,
    previewHasNext,
    isReportCompleteModalOpen,
    isGeneratingPdf,
    reportFileName,
    isDownloadingPdf,
    isPdfDownloadErrorVisible,
    fetchReportRooms,
    handleSelectReport,
    handleLoadMorePreview,
    retryPreviewMessages,
    handleOpenReportCompleteModal,
    handleCloseReportCompleteModal,
    handleDownloadGeneratedPdf,
  } = useTeacherReports();

  return (
    <ReportsPageContainer>
      <ReportRoomListSection
        reportItems={reportItems}
        selectedReportId={selectedReportId}
        isLoading={isLoading}
        hasListError={hasListError}
        hasNoData={hasNoData}
        listErrorDisplayMessage={listErrorDisplayMessage}
        onRetryReportRooms={() => void fetchReportRooms()}
        onSelectReport={handleSelectReport}
      />

      <ReportPreviewSection
        selectedReport={selectedReport}
        hasNoData={hasNoData}
        hasListError={hasListError}
        isPreviewLoadError={isPreviewLoadError}
        isPreviewLoading={isPreviewLoading}
        isPreviewLoadingMore={isPreviewLoadingMore}
        previewMessages={previewMessages}
        previewHasNext={previewHasNext}
        isGeneratingPdf={isGeneratingPdf}
        onRetryPreviewMessages={retryPreviewMessages}
        onLoadMorePreview={handleLoadMorePreview}
        onOpenReportCompleteModal={() => void handleOpenReportCompleteModal()}
      />

      <ReportCompleteDialog
        isOpen={isReportCompleteModalOpen}
        reportFileName={reportFileName}
        isDownloadingPdf={isDownloadingPdf}
        isPdfDownloadErrorVisible={isPdfDownloadErrorVisible}
        onClose={handleCloseReportCompleteModal}
        onDownload={() => void handleDownloadGeneratedPdf()}
      />
    </ReportsPageContainer>
  );
};

const ReportsPageContainer = styled.div`
  position: relative;
  display: flex;
  min-height: calc(100vh - ${HEADER_HEIGHT}px);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
