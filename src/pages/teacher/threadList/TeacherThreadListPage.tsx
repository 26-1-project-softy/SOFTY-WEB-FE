import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { InlineButton } from '@/components/common/InlineButton';
import { StatusTagButton, type StatusTagTone } from '@/components/common/chat/StatusTagButton';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/http/apiClient';
import {
  mapApiStatusToThreadStatus,
  toThreadStatusLabel,
  useThreadStatusStore,
  type ThreadStatus,
} from '@/stores/threadStatusStore';
import { IcChat, IcError, IcRefresh } from '@/icons';

type InboxLoadState = 'loading' | 'error' | 'empty' | 'success';
type IntentTone = 'counsel' | 'progress' | 'inquiry' | 'absence' | 'request' | 'done';

type ThreadRoomItem = {
  id: number;
  counterpartName: string;
  studentName: string;
  preview: string;
  timeText: string;
  unreadCount: number;
  intentTag: { label: string; tone: IntentTone };
  status: ThreadStatus;
};

type ChatRoomResponse = {
  chatRoomId: number;
  counterpartName: string;
  studentName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: string;
  intentLabel: string;
};

type ChatRoomsApiResponse = {
  success: boolean;
  code: number;
  message: string;
  content?: ChatRoomResponse[];
  data?: {
    content?: ChatRoomResponse[];
    items?: ChatRoomResponse[];
  } | null;
  nextCursor?: number | null;
  size?: number;
  hasNext?: boolean;
};

const resolveTagTone = (label: string): IntentTone => {
  const value = label.trim().toLowerCase();

  if (value.includes('상담') || value.includes('counsel')) return 'counsel';
  if (value.includes('처리') || value.includes('진행') || value.includes('process'))
    return 'progress';
  if (value.includes('문의') || value.includes('question') || value.includes('inquiry'))
    return 'inquiry';
  if (value.includes('결석') || value.includes('지각') || value.includes('absence'))
    return 'absence';
  if (value.includes('요청') || value.includes('request')) return 'request';

  return 'done';
};

const formatTimeText = (value: string) => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const now = new Date();
  const isSameDay =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate();

  if (isSameDay) {
    const hour24 = parsed.getHours();
    const minute = `${parsed.getMinutes()}`.padStart(2, '0');
    const period = hour24 >= 12 ? '오후' : '오전';
    const hour12 = hour24 % 12 || 12;

    return `${period} ${hour12}:${minute}`;
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toThreadRoomItem = (room: ChatRoomResponse): ThreadRoomItem => {
  const intentLabel = room.intentLabel?.trim() || '미분류';

  return {
    id: room.chatRoomId,
    counterpartName: room.counterpartName || '-',
    studentName: room.studentName || '-',
    preview: room.lastMessage || '-',
    timeText: formatTimeText(room.lastMessageAt),
    unreadCount: room.unreadCount ?? 0,
    intentTag: { label: intentLabel, tone: resolveTagTone(intentLabel) },
    status: mapApiStatusToThreadStatus(room.status),
  };
};

export const TeacherThreadListPage = () => {
  const navigate = useNavigate();
  const statusByRoomId = useThreadStatusStore(state => state.statusByRoomId);
  const [rooms, setRooms] = useState<ThreadRoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const { data } = await apiClient.get<ChatRoomsApiResponse>('/chat-rooms', {
        params: { page: 0, size: 20 },
      });

      const list = data.data?.content ?? [];
      setRooms(list.map(toThreadRoomItem));
    } catch {
      setRooms([]);
      setErrorMessage('대화 목록을 불러올 수 없어요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, []);

  const loadState = useMemo<InboxLoadState>(() => {
    if (isLoading) return 'loading';
    if (errorMessage) return 'error';
    if (rooms.length === 0) return 'empty';
    return 'success';
  }, [errorMessage, isLoading, rooms.length]);

  return (
    <ThreadListPageContainer>
      <InboxListSection>
        {loadState === 'loading' ? <StatusText>대화 목록을 불러오는 중입니다.</StatusText> : null}

        {loadState === 'success' ? (
          <ThreadList>
            {rooms.map(room => (
              <ThreadCard
                key={room.id}
                type="button"
                onClick={() =>
                  navigate(ROUTES.teacherThreadDetail.replace(':threadId', String(room.id)))
                }
              >
                <Avatar>{room.studentName.charAt(0)}</Avatar>
                <CardBody>
                  <TopRow>
                    <NameWrap>
                      <ParentName>{room.counterpartName}</ParentName>
                      <StudentName>{room.studentName}</StudentName>
                    </NameWrap>
                    <TimeText>{room.timeText}</TimeText>
                  </TopRow>
                  <PreviewText>{room.preview}</PreviewText>
                  <BottomRow>
                    <TagWrap>
                      <Tag tone={room.intentTag.tone}>{room.intentTag.label}</Tag>
                      <StatusTagButton
                        label={toThreadStatusLabel(statusByRoomId[room.id] ?? room.status)}
                        tone={resolveThreadStatusTone(statusByRoomId[room.id] ?? room.status)}
                      />
                    </TagWrap>
                    {room.unreadCount > 0 ? <UnreadBadge>{room.unreadCount}</UnreadBadge> : null}
                  </BottomRow>
                </CardBody>
              </ThreadCard>
            ))}
          </ThreadList>
        ) : null}

        {loadState === 'empty' ? (
          <EmptySection>
            <SectionEmptyState
              icon={IcChat}
              title="표시할 대화 목록이 없어요"
              description="새 메시지가 오면 이곳에 채팅방이 표시됩니다."
            />
          </EmptySection>
        ) : null}
      </InboxListSection>

      {loadState === 'error' ? (
        <ErrorStateSection>
          <ErrorIconWrap>
            <IcError />
          </ErrorIconWrap>
          <ErrorTitle>대화 목록을 불러올 수 없어요</ErrorTitle>
          <ErrorDescription>잠시 후 다시 시도해주세요.</ErrorDescription>
          <RetryButton
            type="button"
            variant="primary"
            size="L"
            icon={IcRefresh}
            label="다시 시도"
            onClick={() => void loadRooms()}
          />
        </ErrorStateSection>
      ) : null}
    </ThreadListPageContainer>
  );
};

const resolveThreadStatusTone = (status: ThreadStatus): StatusTagTone => {
  if (status === 'done') return 'done';
  if (status === 'hold') return 'hold';
  return 'processing';
};

const ThreadListPageContainer = styled.section`
  min-height: calc(100vh - 72px);
  background: ${({ theme }) => theme.colors.background.bg2};
`;

const InboxListSection = styled.div`
  width: 100%;
  padding: 24px 24px 0;
`;

const StatusText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ThreadList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ThreadCard = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 16px;
  display: flex;
  gap: 14px;
  text-align: left;
`;

const Avatar = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.brand.dark};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const NameWrap = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ParentName = styled.strong`
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const TimeText = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const PreviewText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomRow = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const TagWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Tag = styled.span<{ tone: IntentTone }>`
  ${({ theme }) => theme.fonts.labelXS};
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid
    ${({ tone, theme }) => {
      if (tone === 'counsel') return theme.colors.intent.counseling.border;
      if (tone === 'progress') return theme.colors.threadStatus.processing.border;
      if (tone === 'inquiry') return theme.colors.intent.inquiry.border;
      if (tone === 'absence') return theme.colors.intent.absenceLate.border;
      if (tone === 'request') return theme.colors.intent.request.border;
      return theme.colors.border.border2;
    }};
  color: ${({ tone, theme }) => {
    if (tone === 'counsel') return theme.colors.intent.counseling.text;
    if (tone === 'progress') return theme.colors.threadStatus.processing.text;
    if (tone === 'inquiry') return theme.colors.intent.inquiry.text;
    if (tone === 'absence') return theme.colors.intent.absenceLate.text;
    if (tone === 'request') return theme.colors.intent.request.text;
    return theme.colors.text.text3;
  }};
  background: ${({ tone, theme }) => {
    if (tone === 'counsel') return theme.colors.intent.counseling.background;
    if (tone === 'progress') return theme.colors.threadStatus.processing.background;
    if (tone === 'inquiry') return theme.colors.intent.inquiry.background;
    if (tone === 'absence') return theme.colors.intent.absenceLate.background;
    if (tone === 'request') return theme.colors.intent.request.background;
    return theme.colors.background.bg3;
  }};
`;

const UnreadBadge = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  min-width: 32px;
  height: 32px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
`;

const EmptySection = styled.div`
  min-height: calc(100vh - 180px);
`;

const ErrorStateSection = styled.div`
  min-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ErrorIconWrap = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const ErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelM};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const RetryButton = styled(InlineButton)`
  margin-top: 14px;

  svg {
    width: 16px;
    height: 16px;
  }
`;
