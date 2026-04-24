import styled from '@emotion/styled';
import { InlineButton } from '@/components/common/InlineButton';
import { IcChat, IcDownload, IcError, IcFile, IcRefresh } from '@/icons';
import { useTeacherReports } from '@/features/teacher/reports/useTeacherReports';
import { resolveIntentType, type IntentType } from '@/utils/reports/intentMapper';
import {
  formatDateOnly,
  formatDateTime,
  formatPreviewName,
} from '@/utils/reports/reportFormatters';

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
          <ErrorPane>
            <ErrorIconWrap>
              <IcError />
            </ErrorIconWrap>
            <ErrorTitle>대화 목록을 불러올 수 없어요.</ErrorTitle>
            <ErrorDescription>{listErrorDisplayMessage}</ErrorDescription>
            <InlineButton
              variant="primary"
              size="L"
              icon={IcRefresh}
              label="다시 시도"
              onClick={() => void fetchReportRooms()}
            />
          </ErrorPane>
        ) : null}

        {hasNoData && !hasListError ? (
          <EmptyPane>
            <EmptyIconWrap>
              <IcChat />
            </EmptyIconWrap>
            <EmptyTitle>아직 데이터가 없어요.</EmptyTitle>
            <EmptyDescription>
              학부모와의 대화가 시작되면 이곳에서 대화를 선택해
              <br />
              리포트를 생성할 수 있어요.
            </EmptyDescription>
          </EmptyPane>
        ) : null}

        {!isLoading && !hasListError && !hasNoData ? (
          <ReportList>
            {reportItems.map(item => (
              <ReportListItem
                key={item.chatRoomId}
                isSelected={item.chatRoomId === selectedReportId}
                onClick={() => handleSelectReport(item.chatRoomId)}
              >
                <ReportItemTopRow>
                  <ReportTitleWrap>
                    <ParentName>{item.parentName || '-'}</ParentName>
                    <StudentName>{item.studentName || '-'}</StudentName>
                  </ReportTitleWrap>
                  <LastMessageDate>
                    마지막 메시지: {formatDateOnly(item.lastMessageAt)}
                  </LastMessageDate>
                </ReportItemTopRow>

                <IntentBadge
                  intent={resolveIntentType({
                    intentType: item.intentType,
                    intentLabel: item.intentLabel,
                  })}
                >
                  {item.intentLabel || '-'}
                </IntentBadge>
              </ReportListItem>
            ))}
          </ReportList>
        ) : null}
      </ReportListSection>

      <PreviewSection>
        <PreviewHeader>
          <PreviewTitle>미리보기</PreviewTitle>
          <InlineButton
            variant="primary"
            size="L"
            icon={IcFile}
            label={isGeneratingPdf ? '생성 중...' : 'PDF 생성하기'}
            disabled={
              !selectedReport || hasNoData || hasListError || isPreviewLoadError || isGeneratingPdf
            }
            onClick={() => void handleOpenReportCompleteModal()}
          />
        </PreviewHeader>

        <PreviewBody>
          {!selectedReport || hasNoData || hasListError ? (
            <PreviewEmptyPane>
              <EmptyIconWrap>
                <IcFile />
              </EmptyIconWrap>
              <EmptyTitle>미리볼 대화를 선택해주세요</EmptyTitle>
              <EmptyDescription>
                왼쪽 목록에서 대화를 선택하면 대화 리포트를 확인할 수 있어요.
              </EmptyDescription>
            </PreviewEmptyPane>
          ) : isPreviewLoading ? (
            <StatusText>미리보기를 불러오는 중이에요...</StatusText>
          ) : isPreviewLoadError ? (
            <ErrorPane>
              <ErrorIconWrap>
                <IcError />
              </ErrorIconWrap>
              <ErrorTitle>미리보기를 불러올 수 없어요.</ErrorTitle>
              <ErrorDescription>잠시 후 다시 시도해 주세요.</ErrorDescription>
              <InlineButton
                variant="primary"
                size="L"
                icon={IcRefresh}
                label="다시 시도"
                onClick={retryPreviewMessages}
              />
            </ErrorPane>
          ) : previewMessages.length === 0 ? (
            <PreviewEmptyPane>
              <EmptyIconWrap>
                <IcFile />
              </EmptyIconWrap>
              <EmptyTitle>미리보기 데이터가 없어요.</EmptyTitle>
              <EmptyDescription>선택한 채팅방에 표시할 메시지가 없어요.</EmptyDescription>
            </PreviewEmptyPane>
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
                <PreviewLoadMoreButtonWrap>
                  <InlineButton
                    variant="ghost"
                    size="M"
                    label={isPreviewLoadingMore ? '불러오는 중...' : '더 보기'}
                    disabled={isPreviewLoadingMore}
                    onClick={handleLoadMorePreview}
                  />
                </PreviewLoadMoreButtonWrap>
              ) : null}
            </>
          )}
        </PreviewBody>
      </PreviewSection>

      {isReportCompleteModalOpen ? (
        <ModalOverlay onClick={handleCloseReportCompleteModal}>
          <ModalCard onClick={event => event.stopPropagation()}>
            <ModalIconWrap>
              <IcFile />
            </ModalIconWrap>

            <ModalTitle>리포트 생성 완료</ModalTitle>
            <ModalDescription>PDF 파일이 준비되었습니다.</ModalDescription>

            <FileInfoCard>
              <FileInfoLabel>파일명</FileInfoLabel>
              <FileInfoValue>{reportFileName}</FileInfoValue>
            </FileInfoCard>

            {isPdfDownloadErrorVisible ? (
              <ModalErrorBox role="alert">
                <ModalErrorIcon>
                  <IcError />
                </ModalErrorIcon>
                <ModalErrorTextWrap>
                  <ModalErrorTitle>PDF 다운로드에 실패했어요.</ModalErrorTitle>
                  <ModalErrorDescription>잠시 후 다시 시도해 주세요.</ModalErrorDescription>
                </ModalErrorTextWrap>
              </ModalErrorBox>
            ) : null}

            <ModalActionRow>
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
            </ModalActionRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}
    </ReportsPageContainer>
  );
};

const ReportsPageContainer = styled.div`
  position: relative;
  display: flex;
  min-height: calc(100vh - 72px);
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const ReportListSection = styled.section`
  width: 52%;
  min-width: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 16px 18px;

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
  border: 1px solid transparent;
  border-radius: 18px;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.background.bg4 : theme.colors.background.bg1};
  padding: 12px 14px;
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

const ReportTitleWrap = styled.div`
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

const IntentBadge = styled.span<{ intent: IntentType }>`
  ${({ theme }) => theme.fonts.labelXS};
  display: inline-flex;
  margin-top: 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ intent, theme }) => {
      if (intent === 'absenceLate') return theme.colors.intent.absenceLate.border;
      if (intent === 'counseling') return theme.colors.intent.counseling.border;
      if (intent === 'inquiry') return theme.colors.intent.inquiry.border;
      return theme.colors.intent.request.border;
    }};
  background: ${({ intent, theme }) => {
    if (intent === 'absenceLate') return theme.colors.intent.absenceLate.background;
    if (intent === 'counseling') return theme.colors.intent.counseling.background;
    if (intent === 'inquiry') return theme.colors.intent.inquiry.background;
    return theme.colors.intent.request.background;
  }};
  color: ${({ intent, theme }) => {
    if (intent === 'absenceLate') return theme.colors.intent.absenceLate.text;
    if (intent === 'counseling') return theme.colors.intent.counseling.text;
    if (intent === 'inquiry') return theme.colors.intent.inquiry.text;
    return theme.colors.intent.request.text;
  }};
  padding: 4px 10px;
`;

const PreviewSection = styled.section`
  width: 48%;
  min-width: 0;
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

const PreviewTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelL};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const PreviewBody = styled.div`
  min-height: 620px;
  border-radius: 0 0 24px 24px;
  background: ${({ theme }) => theme.colors.reports.previewBackground};
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.reports.senderAvatarBackground};
  color: ${({ theme }) => theme.colors.brand.dark};
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  margin-top: 10px;
  max-width: 78%;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 20px 24px;
`;

const OutgoingTime = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const OutgoingBubble = styled.div`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 8px;
  max-width: 78%;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 20px 24px;
`;

const PreviewLoadMoreButtonWrap = styled.div`
  align-self: center;
  margin-top: 4px;
`;

const StatusText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 4px 4px 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ErrorPane = styled.div`
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ErrorIconWrap = styled.div`
  color: ${({ theme }) => theme.colors.text.text2};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const ErrorTitle = styled.h4`
  ${({ theme }) => theme.fonts.labelS};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text2};
`;

const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const EmptyPane = styled.div`
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const PreviewEmptyPane = styled(EmptyPane)`
  min-height: 560px;
`;

const EmptyIconWrap = styled.div`
  color: ${({ theme }) => theme.colors.text.text4};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const EmptyTitle = styled.h4`
  ${({ theme }) => theme.fonts.labelS};
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const EmptyDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: ${({ theme }) => theme.colors.overlay.dim1};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.modal};
  padding: 20px;
`;

const ModalIconWrap = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg3};
  color: ${({ theme }) => theme.colors.text.text4};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelM};
  margin: 14px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ModalDescription = styled.p`
  ${({ theme }) => theme.fonts.labelS};
  margin: 10px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text2};
`;

const FileInfoCard = styled.div`
  margin-top: 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg3};
  padding: 14px 16px;
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

const ModalActionRow = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 10px;
`;

const ModalErrorBox = styled.div`
  margin-top: 14px;
  border: 1px solid ${({ theme }) => theme.colors.reports.modalErrorBorder};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.reports.modalErrorBackground};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalErrorIcon = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ModalErrorTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ModalErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.reports.modalErrorText};
`;

const ModalErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.reports.modalErrorText};
`;
