import styled from '@emotion/styled';
import { useTeacherReports } from '@/features/teacher/reports/hooks/useTeacherReports';
import {
  getInquiryIntentByType,
  INQUIRY_INTENT_COLOR_KEY,
  INQUIRY_INTENT_LABEL,
  type InquiryIntentType,
} from '@/constants/inquiryIntent';
import {
  formatDateOnly,
  formatDateTime,
  formatPreviewName,
} from '@/features/teacher/reports/lib/reportFormatters';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { Loader } from '@/components/common/Loader';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { IcChat, IcDownload, IcFile } from '@/icons';

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
      <ReportListSection>
        {isLoading ? <StatusText>목록을 불러오는 중이에요...</StatusText> : null}

        {hasListError ? (
          <SectionErrorState
            title="채팅방 목록을 불러오지 못했어요"
            description={listErrorDisplayMessage}
            onRetry={() => void fetchReportRooms()}
          />
        ) : null}

        {hasNoData && !hasListError ? (
          <SectionEmptyState
            icon={IcChat}
            title="아직 데이터가 없어요"
            description={`학부모님과의 대화가 시작되면 이곳에서 채팅방을 선택해\n리포트를 생성할 수 있어요.`}
          />
        ) : null}

        {!isLoading && !hasListError && !hasNoData ? (
          <ReportList>
            {reportItems.map(item => {
              const intentType = getInquiryIntentByType(item.intentType);

              return (
                <ReportListItem
                  key={item.chatRoomId}
                  isSelected={item.chatRoomId === selectedReportId}
                  onClick={() => handleSelectReport(item.chatRoomId)}
                >
                  <ReportItemTopRow>
                    <ReportTitleArea>
                      <ParentName>{item.parentName || '-'}</ParentName>
                      <StudentName>{item.studentName || '-'}</StudentName>
                    </ReportTitleArea>
                    <LastMessageDate>
                      마지막 메시지: {formatDateOnly(item.lastMessageAt)}
                    </LastMessageDate>
                  </ReportItemTopRow>

                  <IntentBadge $intentType={intentType}>
                    {INQUIRY_INTENT_LABEL[intentType]}
                  </IntentBadge>
                </ReportListItem>
              );
            })}
          </ReportList>
        ) : null}
      </ReportListSection>

      <PreviewSection>
        <PreviewHeader>
          <PreviewTitle>미리보기</PreviewTitle>
          <PreviewHeaderAction>
            <InlineButton
              variant="primary"
              size="L"
              icon={IcFile}
              label={isGeneratingPdf ? '생성 중...' : 'PDF 생성하기'}
              disabled={
                !selectedReport ||
                hasNoData ||
                hasListError ||
                isPreviewLoadError ||
                isGeneratingPdf
              }
              onClick={() => void handleOpenReportCompleteModal()}
            />
          </PreviewHeaderAction>
        </PreviewHeader>

        <PreviewBody>
          {!selectedReport || hasNoData || hasListError ? (
            <SectionEmptyState
              icon={IcChat}
              title="미리보기 대상을 선택해주세요"
              description="왼쪽 목록에서 채팅방을 선택하면 해당 리포트를 확인할 수 있어요."
            />
          ) : isPreviewLoading ? (
            <Loader />
          ) : isPreviewLoadError ? (
            <SectionErrorState
              title="미리보기를 불러오지 못했어요"
              description="잠시 후 다시 시도해 주세요"
              onRetry={retryPreviewMessages}
            />
          ) : previewMessages.length === 0 ? (
            <SectionEmptyState
              icon={IcChat}
              title="미리보기 데이터가 없어요"
              description="선택한 채팅방에 표시할 메시지가 없어요"
            />
          ) : (
            <>
              {previewMessages.map(message => (
                <MessageBlock
                  key={`${message.messageId}-${message.createdAt}`}
                  align={message.isMine ? 'right' : 'left'}
                >
                  {message.isMine ? (
                    <OutgoingTime>{formatDateTime(message.createdAt)}</OutgoingTime>
                  ) : (
                    <SenderMetaRow>
                      <SenderAvatar>
                        {selectedReport.parentName?.trim()
                          ? selectedReport.parentName.charAt(0)
                          : '-'}
                      </SenderAvatar>
                      <SenderInfo>
                        <SenderName>{formatPreviewName(selectedReport.parentName)}</SenderName>
                        <SenderTime>{formatDateTime(message.createdAt)}</SenderTime>
                      </SenderInfo>
                    </SenderMetaRow>
                  )}

                  {message.isMine ? (
                    <OutgoingBubble>{message.content || '-'}</OutgoingBubble>
                  ) : (
                    <IncomingBubble>{message.content || '-'}</IncomingBubble>
                  )}
                </MessageBlock>
              ))}

              {previewHasNext ? (
                <PreviewLoadMoreButtonArea>
                  <InlineButton
                    variant="ghost"
                    size="M"
                    label={isPreviewLoadingMore ? '불러오는 중...' : '더 보기'}
                    disabled={isPreviewLoadingMore}
                    onClick={handleLoadMorePreview}
                  />
                </PreviewLoadMoreButtonArea>
              ) : null}
            </>
          )}
        </PreviewBody>
      </PreviewSection>

      <Dialog isOpen={isReportCompleteModalOpen} onClose={handleCloseReportCompleteModal}>
        <DialogHeader
          icon={IcFile}
          title="리포트 생성 완료"
          description="PDF 파일이 준비되었어요."
          iconBgColor="#F2F2F2"
          iconColor="#808080"
        />

        <FileInfoCard>
          <FileInfoLabel>파일명</FileInfoLabel>
          <FileInfoValue>{reportFileName}</FileInfoValue>
        </FileInfoCard>

        {isPdfDownloadErrorVisible ? (
          <Alert title="PDF 다운로드에 실패했어요" description="잠시 후 다시 시도해 주세요" />
        ) : null}

        <DialogFooter>
          <InlineButton
            variant="ghost"
            size="L"
            label="닫기"
            width="100%"
            onClick={handleCloseReportCompleteModal}
          />
          <InlineButton
            variant="primary"
            size="L"
            icon={IcDownload}
            label={isDownloadingPdf ? '다운로드 중...' : '다운로드'}
            width="100%"
            disabled={isDownloadingPdf}
            onClick={() => void handleDownloadGeneratedPdf()}
          />
        </DialogFooter>
      </Dialog>
    </ReportsPageContainer>
  );
};

const ReportsPageContainer = styled.div`
  position: relative;
  display: flex;
  min-height: calc(100vh - 72px);
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg2};

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const ReportListSection = styled.section`
  width: 52%;
  min-width: 0;
  padding: 16px 18px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};

  @media (max-width: 1200px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  }
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReportListItem = styled.button<{ isSelected: boolean }>`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.background.bg4 : theme.colors.background.bg1};
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.border1};
    background: ${({ theme }) => theme.colors.background.bg4};
  }
`;

const ReportItemTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
`;

const ReportTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ParentName = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const LastMessageDate = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const IntentBadge = styled.span<{ $intentType: InquiryIntentType }>`
  ${({ theme }) => theme.fonts.labelXS};
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;

  ${({ $intentType, theme }) => {
    const colorKey = INQUIRY_INTENT_COLOR_KEY[$intentType];
    const color = theme.colors.intent[colorKey];

    return `
      border: 1px solid ${color.border};
      background: ${color.background};
      color: ${color.text};
    `;
  }}
`;

const PreviewSection = styled.section`
  width: 48%;
  min-width: 0;
  min-height: 0;
  padding: 34px 26px;

  @media (max-width: 1200px) {
    width: 100%;
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-radius: 20px 20px 0 0;
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const PreviewHeaderAction = styled.div`
  flex-shrink: 0;

  button {
    margin: 0;
  }
`;

const PreviewTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelL};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const PreviewBody = styled.div`
  display: flex;
  height: min(620px, calc(100vh - 220px));
  min-height: 420px;
  flex-direction: column;
  gap: 16px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 22px;
  border-radius: 0 0 24px 24px;
  background: ${({ theme }) => theme.colors.background.bg4};
`;

const MessageBlock = styled.div<{ align?: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
`;

const SenderMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SenderAvatar = styled.div`
  ${({ theme }) => theme.fonts.labelS};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const SenderInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const SenderName = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SenderTime = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const IncomingBubble = styled.div`
  ${({ theme }) => theme.fonts.labelS};
  max-width: 78%;
  margin-top: 10px;
  padding: 20px 24px;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const OutgoingTime = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const OutgoingBubble = styled.div`
  ${({ theme }) => theme.fonts.labelS};
  max-width: 78%;
  margin-top: 8px;
  padding: 20px 24px;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
`;

const PreviewLoadMoreButtonArea = styled.div`
  align-self: center;
  margin-top: 4px;
`;

const StatusText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 4px 4px 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const FileInfoCard = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg3};
`;

const FileInfoLabel = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const FileInfoValue = styled.p`
  ${({ theme }) => theme.fonts.labelS};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text2};
`;
