import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { IcDownload, IcError, IcFile, IcInbox, IcRefresh } from '@/icons';
import { reportsApi, type ReportChatRoomItem } from '@/services/teacher/reportsApi';

export const TeacherReportsPage = () => {
  const [reportItems, setReportItems] = useState<ReportChatRoomItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewLoadError, setIsPreviewLoadError] = useState(false);
  const [isReportCompleteModalOpen, setIsReportCompleteModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdfFileName, setGeneratedPdfFileName] = useState('');
  const [generatedPdfDownloadUrl, setGeneratedPdfDownloadUrl] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPdfDownloadErrorVisible, setIsPdfDownloadErrorVisible] = useState(false);
  const [isPdfErrorToastVisible, setIsPdfErrorToastVisible] = useState(false);
  const [pdfErrorToastMessage, setPdfErrorToastMessage] = useState('');
  const pdfErrorToastTimerRef = useRef<number | null>(null);

  const selectedReport = useMemo(
    () => reportItems.find(item => item.chatRoomId === selectedReportId) ?? null,
    [reportItems, selectedReportId]
  );
  const hasNoData = !isLoading && !errorMessage && reportItems.length === 0;
  const hasListError = !isLoading && !!errorMessage;
  const listErrorDisplayMessage = errorMessage || '서비스에 문제가 생겼습니다.';
  const shouldShowPreviewEmptyState =
    hasNoData || hasListError || !selectedReport || isPreviewLoadError;

  const defaultReportFileName = useMemo(() => {
    if (!selectedReport?.lastMessageAt) {
      return '증빙리포트_0000-00-00.pdf';
    }

    return `증빙리포트_${formatDateOnly(selectedReport.lastMessageAt)}.pdf`;
  }, [selectedReport]);
  const reportFileName = generatedPdfFileName || defaultReportFileName;

  const fetchReportRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await reportsApi.getReportChatRooms({ page: 0, size: 20 });

      setReportItems(response.data);
      setSelectedReportId(prev => {
        if (prev && response.data.some(item => item.chatRoomId === prev)) {
          return prev;
        }

        return null;
      });
      setIsPreviewLoadError(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const isNetworkError = !axiosError.response;
      const isServerError = typeof status === 'number' && status >= 500;

      if (isNetworkError || isServerError) {
        setErrorMessage('서비스에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(axiosError.response?.data?.message || '채팅방 목록을 불러오지 못했어요.');
      }
      setReportItems([]);
      setSelectedReportId(null);
      setIsPreviewLoadError(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectReport = (chatRoomId: number) => {
    setSelectedReportId(chatRoomId);
    setIsPreviewLoadError(false);
    // TODO: 미리보기 API 연동 시 실패하면 setIsPreviewLoadError(true) 처리
  };

  const openPdfErrorToast = useCallback((message?: string) => {
    setPdfErrorToastMessage(message || 'PDF 생성에 실패했어요.');
    setIsPdfErrorToastVisible(true);

    if (pdfErrorToastTimerRef.current) {
      window.clearTimeout(pdfErrorToastTimerRef.current);
    }

    pdfErrorToastTimerRef.current = window.setTimeout(() => {
      setIsPdfErrorToastVisible(false);
      pdfErrorToastTimerRef.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    void fetchReportRooms();
  }, [fetchReportRooms]);

  useEffect(() => {
    return () => {
      if (pdfErrorToastTimerRef.current) {
        window.clearTimeout(pdfErrorToastTimerRef.current);
      }
    };
  }, []);

  const handleOpenReportCompleteModal = async () => {
    if (!selectedReport || isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const response = await reportsApi.createReportPdf(selectedReport.chatRoomId);

      if (!response.success) {
        openPdfErrorToast('PDF 생성에 실패했어요.');
        return;
      }

      setGeneratedPdfFileName(response.fileName || defaultReportFileName);
      setGeneratedPdfDownloadUrl(response.downloadUrl || '');
      setIsReportCompleteModalOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      openPdfErrorToast(axiosError.response?.data?.message || 'PDF 생성에 실패했어요.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCloseReportCompleteModal = () => {
    setIsReportCompleteModalOpen(false);
    setIsPdfDownloadErrorVisible(false);
    setIsDownloadingPdf(false);
  };

  const handleDownloadGeneratedPdf = async () => {
    setIsPdfDownloadErrorVisible(false);

    if (!generatedPdfDownloadUrl) {
      setIsPdfDownloadErrorVisible(true);
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const response = await fetch(generatedPdfDownloadUrl);

      if (!response.ok) {
        throw new Error('Failed to download pdf');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = reportFileName || '증빙리포트.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setIsPdfDownloadErrorVisible(true);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

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
        {isLoading ? <StatusText>목록을 불러오는 중이에요...</StatusText> : null}
        {hasListError ? (
          <ErrorPane>
            <ErrorIconWrap>
              <IcError />
            </ErrorIconWrap>
            <ErrorTitle>대화 목록을 불러올 수 없어요</ErrorTitle>
            <ErrorDescription>{listErrorDisplayMessage}</ErrorDescription>
            <RetryButton type="button" onClick={() => void fetchReportRooms()}>
              <IcRefresh />
              다시 시도
            </RetryButton>
          </ErrorPane>
        ) : null}

        {hasNoData && !hasListError ? (
          <EmptyPane>
            <EmptyIconWrap>
              <IcInbox />
            </EmptyIconWrap>
            <EmptyTitle>아직 대화가 없어요</EmptyTitle>
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
          <PreviewTitle>미리보기</PreviewTitle>
          <PdfButton
            type="button"
            disabled={
              !selectedReport || hasNoData || hasListError || isPreviewLoadError || isGeneratingPdf
            }
            onClick={handleOpenReportCompleteModal}
          >
            <IcFile />
            {isGeneratingPdf ? '생성 중...' : 'PDF 생성하기'}
          </PdfButton>
        </PreviewHeader>

        <PreviewBody>
          {shouldShowPreviewEmptyState ? (
            <PreviewEmptyPane>
              <EmptyIconWrap>
                <IcFile />
              </EmptyIconWrap>
              <EmptyTitle>미리볼 대화를 선택해주세요</EmptyTitle>
              <EmptyDescription>
                왼쪽 목록에서 대화를 선택하면 대화 리포트를 확인할 수 있어요.
              </EmptyDescription>
            </PreviewEmptyPane>
          ) : (
            <>
              <MessageBlock>
                <SenderMetaRow>
                  <SenderAvatar>
                    {selectedReport?.parentName?.trim() ? selectedReport.parentName.charAt(0) : '-'}
                  </SenderAvatar>
                  <SenderInfo>
                    <SenderName>{formatPreviewName(selectedReport?.parentName)}</SenderName>
                    <SenderTime>{formatDateTime(selectedReport?.lastMessageAt)}</SenderTime>
                  </SenderInfo>
                </SenderMetaRow>

                <IncomingBubble>
                  {selectedReport
                    ? '선택한 채팅방의 대화 미리보기가 여기에 표시돼요.'
                    : '좌측에서 채팅방을 선택하면 미리보기가 표시돼요.'}
                </IncomingBubble>
              </MessageBlock>

              <MessageBlock align="right">
                <OutgoingTime>{formatDateTime(selectedReport?.lastMessageAt)}</OutgoingTime>
                <OutgoingBubble>
                  {selectedReport
                    ? 'PDF 생성 시 선택된 채팅방의 전체 대화 내역을 기준으로 리포트가 생성됩니다.'
                    : '생성할 채팅방을 먼저 선택해주세요.'}
                </OutgoingBubble>
                <ReadCount>1</ReadCount>
              </MessageBlock>
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
                  <ModalErrorTitle>PDF 다운로드에 실패했어요</ModalErrorTitle>
                  <ModalErrorDescription>잠시 후 다시 시도해 주세요.</ModalErrorDescription>
                </ModalErrorTextWrap>
              </ModalErrorBox>
            ) : null}

            <ModalActionRow>
              <ModalGhostButton type="button" onClick={handleCloseReportCompleteModal}>
                닫기
              </ModalGhostButton>
              <ModalPrimaryButton type="button" onClick={() => void handleDownloadGeneratedPdf()}>
                <IcDownload />
                {isDownloadingPdf ? '다운로드 중...' : '다운로드'}
              </ModalPrimaryButton>
            </ModalActionRow>
          </ModalCard>
        </ModalOverlay>
      ) : null}
    </ReportsPageContainer>
  );
};

type IntentType = 'absenceLate' | 'counseling' | 'request' | 'inquiry';

const toIntentType = (label: string): IntentType => {
  if (label.includes('결석') || label.includes('지각')) {
    return 'absenceLate';
  }

  if (label.includes('상담')) {
    return 'counseling';
  }

  if (label.includes('문의')) {
    return 'inquiry';
  }

  return 'request';
};

const formatDateOnly = (value: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10) || '-';
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  const hour24 = parsed.getHours();
  const minute = `${parsed.getMinutes()}`.padStart(2, '0');
  const period = hour24 >= 12 ? '오후' : '오전';
  const hour12 = hour24 % 12 || 12;

  return `${year}-${month}-${day} ${period} ${hour12}:${minute}`;
};

const formatPreviewName = (name?: string) => {
  if (!name || !name.trim()) {
    return '-';
  }

  return name.replace(' 학부모님', '');
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

const ReadCount = styled.span`
  ${({ theme }) => theme.fonts.body2};
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.brand.dark};
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
