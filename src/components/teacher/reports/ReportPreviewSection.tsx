import styled from '@emotion/styled';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { InlineButton } from '@/components/common/InlineButton';
import { SectionCard } from '@/components/common/SectionCard';
import { MessageBubbleList } from '@/components/common/MessageBubbleList';
import { formatChatMessageDateTime } from '@/utils/formatDateTime';
import { IcChat, IcFile } from '@/icons';
import type { useTeacherReports } from '@/features/teacher/reports/hooks/useTeacherReports';

type TeacherReportsState = ReturnType<typeof useTeacherReports>;

type ReportPreviewSectionProps = {
  selectedReport: TeacherReportsState['selectedReport'];
  hasNoData: TeacherReportsState['hasNoData'];
  hasListError: TeacherReportsState['hasListError'];
  isPreviewLoadError: TeacherReportsState['isPreviewLoadError'];
  isPreviewLoading: TeacherReportsState['isPreviewLoading'];
  isPreviewLoadingMore: TeacherReportsState['isPreviewLoadingMore'];
  previewMessages: TeacherReportsState['previewMessages'];
  previewHasNext: TeacherReportsState['previewHasNext'];
  isGeneratingPdf: TeacherReportsState['isGeneratingPdf'];
  onRetryPreviewMessages: TeacherReportsState['retryPreviewMessages'];
  onLoadMorePreview: TeacherReportsState['handleLoadMorePreview'];
  onOpenReportCompleteModal: () => void;
};

export const ReportPreviewSection = ({
  selectedReport,
  hasNoData,
  hasListError,
  isPreviewLoadError,
  isPreviewLoading,
  isPreviewLoadingMore,
  previewMessages,
  previewHasNext,
  isGeneratingPdf,
  onRetryPreviewMessages,
  onLoadMorePreview,
  onOpenReportCompleteModal,
}: ReportPreviewSectionProps) => {
  const isPdfButtonDisabled =
    !selectedReport || hasNoData || hasListError || isPreviewLoadError || isGeneratingPdf;

  const headerAction = (
    <InlineButton
      variant="primary"
      size="M"
      icon={IcFile}
      label={isGeneratingPdf ? '생성 중...' : 'PDF 생성하기'}
      disabled={isPdfButtonDisabled}
      onClick={onOpenReportCompleteModal}
    />
  );

  if (!selectedReport || hasNoData || hasListError) {
    return (
      <PreviewSection>
        <SectionCard title="대화 내역" headerAction={headerAction}>
          <PreviewBody>
            <SectionEmptyState
              icon={IcChat}
              title="미리보기 대상을 선택해주세요"
              description="왼쪽 목록에서 채팅방을 선택하면 해당 리포트를 확인할 수 있어요."
            />
          </PreviewBody>
        </SectionCard>
      </PreviewSection>
    );
  }

  if (isPreviewLoading) {
    return (
      <PreviewSection>
        <SectionCard title="대화 내역" headerAction={headerAction}>
          <PreviewBody>
            <Loader />
          </PreviewBody>
        </SectionCard>
      </PreviewSection>
    );
  }

  if (isPreviewLoadError) {
    return (
      <PreviewSection>
        <SectionCard title="대화 내역" headerAction={headerAction}>
          <PreviewBody>
            <SectionErrorState
              title="미리보기를 불러오지 못했어요"
              description="잠시 후 다시 시도해 주세요."
              onRetry={onRetryPreviewMessages}
            />
          </PreviewBody>
        </SectionCard>
      </PreviewSection>
    );
  }

  if (previewMessages.length === 0) {
    return (
      <PreviewSection>
        <SectionCard title="대화 내역" headerAction={headerAction}>
          <PreviewBody>
            <SectionEmptyState
              icon={IcChat}
              title="대화 내역이 없어요"
              description="선택한 채팅방에 표시할 메시지가 없어요."
            />
          </PreviewBody>
        </SectionCard>
      </PreviewSection>
    );
  }

  return (
    <PreviewSection>
      <SectionCard title="대화 내역" headerAction={headerAction}>
        <PreviewBody>
          <MessageBubbleList
            messages={previewMessages.map(message => ({
              id: `${message.messageId}-${message.createdAt}`,
              senderName: message.isMine ? '나' : selectedReport.parentName,
              sentAt: formatChatMessageDateTime(message.createdAt),
              content: message.content,
              isMine: message.isMine,
            }))}
          />

          {previewHasNext ? (
            <PreviewLoadMoreButtonArea>
              <InlineButton
                variant="primary"
                size="M"
                label={isPreviewLoadingMore ? '불러오는 중...' : '더 보기'}
                disabled={isPreviewLoadingMore}
                onClick={onLoadMorePreview}
              />
            </PreviewLoadMoreButtonArea>
          ) : null}
        </PreviewBody>
      </SectionCard>
    </PreviewSection>
  );
};

const PreviewSection = styled.section`
  width: 48%;
  min-width: 0;
  min-height: 0;
  padding: 34px 26px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PreviewBody = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: min(620px, calc(100vh - 220px));
  min-height: 420px;
  background: ${({ theme }) => theme.colors.background.bg6};
  padding: 20px 16px;
  gap: 16px;
`;

const PreviewLoadMoreButtonArea = styled.div`
  align-self: center;
  margin-top: 4px;
`;
