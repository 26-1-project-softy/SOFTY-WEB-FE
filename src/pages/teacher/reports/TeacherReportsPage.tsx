import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { IcFile } from '@/icons';
import { reportsApi, type ReportChatRoomItem } from '@/services/teacher/reportsApi';

export const TeacherReportsPage = () => {
  const [reportItems, setReportItems] = useState<ReportChatRoomItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedReport = useMemo(
    () => reportItems.find(item => item.chatRoomId === selectedReportId) ?? reportItems[0] ?? null,
    [selectedReportId]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchReportRooms = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await reportsApi.getReportChatRooms({ page: 0, size: 20 });

        if (!isMounted) {
          return;
        }

        setReportItems(response.data);
        setSelectedReportId(prev => {
          if (prev && response.data.some(item => item.chatRoomId === prev)) {
            return prev;
          }

          return response.data[0]?.chatRoomId ?? null;
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const axiosError = error as AxiosError<{ message?: string }>;
        setErrorMessage(axiosError.response?.data?.message || '채팅방 목록을 불러오지 못했어요.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchReportRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ReportsPageContainer>
      <ReportListSection>
        {isLoading ? <StatusText>목록을 불러오는 중이에요...</StatusText> : null}
        {!isLoading && errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

        {!isLoading && !errorMessage ? (
          <ReportList>
            {reportItems.length === 0 ? (
              <StatusText>표시할 채팅방이 없어요.</StatusText>
            ) : (
              reportItems.map(item => (
                <ReportListItem
                  key={item.chatRoomId}
                  isSelected={item.chatRoomId === selectedReportId}
                  onClick={() => setSelectedReportId(item.chatRoomId)}
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
              ))
            )}
          </ReportList>
        ) : null}
      </ReportListSection>

      <PreviewSection>
        <PreviewHeader>
          <PreviewTitle>미리보기</PreviewTitle>
          <PdfButton type="button" disabled={!selectedReport}>
            <IcFile />
            PDF 생성하기
          </PdfButton>
        </PreviewHeader>

        <PreviewBody>
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
        </PreviewBody>
      </PreviewSection>
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

const ErrorText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 4px 4px 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;
