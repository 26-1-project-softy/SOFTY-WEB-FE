import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import {
  StatusTagButton,
  type StatusTagTone,
} from '@/components/teacher/threadDetail/StatusTagButton';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/http/apiClient';
import {
  mapApiStatusToThreadStatus,
  toThreadStatusLabel,
  useThreadStatusStore,
  type ThreadStatus,
} from '@/stores/threadStatusStore';
import { IcChat } from '@/icons';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import {
  getInquiryIntentByType,
  INQUIRY_INTENT_COLOR_KEY,
  INQUIRY_INTENT_LABEL,
  type InquiryIntentType,
} from '@/constants/inquiryIntent';

type InboxLoadState = 'loading' | 'error' | 'empty' | 'success';

type ThreadRoomItem = {
  id: number;
  counterpartName: string;
  studentName: string;
  preview: string;
  timeText: string;
  unreadCount: number;
  intentTag: {
    type: InquiryIntentType;
    label: string;
  };
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
  intentType?: string | null;
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
  const intentType = getInquiryIntentByType(room.intentType);

  return {
    id: room.chatRoomId,
    counterpartName: room.counterpartName || '-',
    studentName: room.studentName || '-',
    preview: room.lastMessage || '-',
    timeText: formatTimeText(room.lastMessageAt),
    unreadCount: room.unreadCount ?? 0,
    intentTag: {
      type: intentType,
      label: INQUIRY_INTENT_LABEL[intentType],
    },
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

      const list = data.data?.content ?? data.data?.items ?? data.content ?? [];

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
                      <Tag $intentType={room.intentTag.type}>{room.intentTag.label}</Tag>
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
        <SectionErrorState
          onRetry={() => void loadRooms()}
          title="대화 목록을 불러올 수 없어요"
          description="잠시 후 다시 시도해주세요."
        />
      ) : null}
    </ThreadListPageContainer>
  );
};

const resolveThreadStatusTone = (status: ThreadStatus): StatusTagTone => {
  if (status === 'done') return 'done';
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

const Tag = styled.span<{ $intentType: InquiryIntentType }>`
  ${({ theme }) => theme.fonts.labelXS};
  border-radius: 999px;
  padding: 4px 10px;

  ${({ $intentType, theme }) => {
    const colorKey = INQUIRY_INTENT_COLOR_KEY[$intentType];
    const color = theme.colors.intent[colorKey];

    return `
      border: 1px solid ${color.border};
      color: ${color.text};
      background: ${color.background};
    `;
  }}
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
