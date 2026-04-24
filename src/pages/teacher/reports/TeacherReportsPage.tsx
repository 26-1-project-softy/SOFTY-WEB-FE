import styled from '@emotion/styled';
import { IcDownload, IcError, IcFile, IcInbox, IcRefresh } from '@/icons';
import { useTeacherReports } from '@/features/teacher/reports/useTeacherReports';
import {
  formatDateOnly,
  formatDateTime,
  formatPreviewName,
  toIntentType,
  type IntentType,
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
    isPdfErrorToastVisible,
    pdfErrorToastMessage,
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
      {isPdfErrorToastVisible ? (
        <TopErrorToast role="alert">
          <TopErrorIconWrap>
            <IcError />
          </TopErrorIconWrap>
          <TopErrorText>{pdfErrorToastMessage}</TopErrorText>
        </TopErrorToast>
      ) : null}

      <ReportListSection>
        {isLoading ? <StatusText>紐⑸줉??遺덈윭?ㅻ뒗 以묒씠?먯슂...</StatusText> : null}
        {hasListError ? (
          <ErrorPane>
            <ErrorIconWrap>
              <IcError />
            </ErrorIconWrap>
            <ErrorTitle>대화 목록을 불러올 수 없어요.</ErrorTitle>
            <ErrorDescription>{listErrorDisplayMessage}</ErrorDescription>
            <RetryButton type="button" onClick={() => void fetchReportRooms()}>
              <IcRefresh />
              ?ㅼ떆 ?쒕룄
            </RetryButton>
          </ErrorPane>
        ) : null}

        {hasNoData && !hasListError ? (
          <EmptyPane>
            <EmptyIconWrap>
              <IcInbox />
            </EmptyIconWrap>
            <EmptyTitle>아직 데이터가 없어요.</EmptyTitle>
            <EmptyDescription>
              ?숇?紐⑥?????붽? ?쒖옉?섎㈃ ?닿납?먯꽌 ??붾? ?좏깮??
              <br />
              由ы룷?몃? ?앹꽦?????덉뼱??
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
                    留덉?留?硫붿떆吏: {formatDateOnly(item.lastMessageAt)}
                  </LastMessageDate>
                </ReportItemTopRow>

                <IntentBadge intent={toIntentType(item.intentLabel)}>
                  {item.intentLabel || '-'}
                </IntentBadge>
              </ReportListItem>
            ))}
          </ReportList>
        ) : null}
      </ReportListSection>

      <PreviewSection>
        <PreviewHeader>
          <PreviewTitle>誘몃━蹂닿린</PreviewTitle>
          <PdfButton
            type="button"
            disabled={
              !selectedReport || hasNoData || hasListError || isPreviewLoadError || isGeneratingPdf
            }
            onClick={handleOpenReportCompleteModal}
          >
            <IcFile />
            {isGeneratingPdf ? '?앹꽦 以?..' : 'PDF ?앹꽦?섍린'}
          </PdfButton>
        </PreviewHeader>

        <PreviewBody>
          {!selectedReport || hasNoData || hasListError ? (
            <PreviewEmptyPane>
              <EmptyIconWrap>
                <IcFile />
              </EmptyIconWrap>
              <EmptyTitle>誘몃━蹂???붾? ?좏깮?댁＜?몄슂</EmptyTitle>
              <EmptyDescription>
                ?쇱そ 紐⑸줉?먯꽌 ??붾? ?좏깮?섎㈃ ???由ы룷?몃? ?뺤씤?????덉뼱??
              </EmptyDescription>
            </PreviewEmptyPane>
          ) : isPreviewLoading ? (
            <StatusText>誘몃━蹂닿린瑜?遺덈윭?ㅻ뒗 以묒씠?먯슂...</StatusText>
          ) : isPreviewLoadError ? (
            <ErrorPane>
              <ErrorIconWrap>
                <IcError />
              </ErrorIconWrap>
              <ErrorTitle>미리보기를 불러올 수 없어요.</ErrorTitle>
              <ErrorDescription>?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??</ErrorDescription>
              <RetryButton type="button" onClick={retryPreviewMessages}>
                <IcRefresh />
                ?ㅼ떆 ?쒕룄
              </RetryButton>
            </ErrorPane>
          ) : previewMessages.length === 0 ? (
            <PreviewEmptyPane>
              <EmptyIconWrap>
                <IcInbox />
              </EmptyIconWrap>
              <EmptyTitle>미리보기 데이터가 없어요.</EmptyTitle>
              <EmptyDescription>?좏깮??梨꾪똿諛⑹뿉 ?쒖떆??硫붿떆吏媛 ?놁뼱??</EmptyDescription>
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
                <PreviewLoadMoreButton
                  type="button"
                  onClick={handleLoadMorePreview}
                  disabled={isPreviewLoadingMore}
                >
                  {isPreviewLoadingMore ? '遺덈윭?ㅻ뒗 以?..' : '??蹂닿린'}
                </PreviewLoadMoreButton>
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

            <ModalTitle>由ы룷???앹꽦 ?꾨즺</ModalTitle>
            <ModalDescription>PDF ?뚯씪??以鍮꾨릺?덉뒿?덈떎.</ModalDescription>

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
                  <ModalErrorDescription>?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??</ModalErrorDescription>
                </ModalErrorTextWrap>
              </ModalErrorBox>
            ) : null}

            <ModalActionRow>
              <ModalGhostButton type="button" onClick={handleCloseReportCompleteModal}>
                ?リ린
              </ModalGhostButton>
              <ModalPrimaryButton type="button" onClick={() => void handleDownloadGeneratedPdf()}>
                <IcDownload />
                {isDownloadingPdf ? '?ㅼ슫濡쒕뱶 以?..' : '?ㅼ슫濡쒕뱶'}
              </ModalPrimaryButton>
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

const TopErrorToast = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 20;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #ff7f89;
  border-radius: 12px;
  background: #fff4f5;
  padding: 6px 12px;
`;

const TopErrorIconWrap = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TopErrorText = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text2};
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

const PdfButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 12px 16px;

  &:disabled {
    background: ${({ theme }) => theme.colors.background.bg5};
    color: ${({ theme }) => theme.colors.text.text4};
    cursor: not-allowed;
  }
`;

const PreviewBody = styled.div`
  min-height: 620px;
  border-radius: 0 0 24px 24px;
  background: #dbe7e3;
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
  background: #b8eadd;
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

const PreviewLoadMoreButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  align-self: center;
  margin-top: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 8px 14px;

  &:disabled {
    color: ${({ theme }) => theme.colors.text.text4};
    cursor: not-allowed;
  }
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

const RetryButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  margin-top: 16px;
  border: none;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  background: rgba(0, 0, 0, 0.42);
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
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.25);
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
  border: 1px solid #ff6b77;
  border-radius: 18px;
  background: #fff5f6;
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
  color: #eb4955;
`;

const ModalErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: #eb4955;
`;

const ModalGhostButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 12px 14px;
`;

const ModalPrimaryButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  flex: 1;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 12px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    background: ${({ theme }) => theme.colors.background.bg5};
    color: ${({ theme }) => theme.colors.text.text4};
    cursor: not-allowed;
  }
`;
