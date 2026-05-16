import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThreadStatusStore } from '@/stores/threadStatusStore';
import { getInquiryIntentByType, INQUIRY_INTENT_LABEL } from '@/constants/inquiryIntent';
import type { InquiryStatusType } from '@/constants/inquiryStatus';
import { formatMessagePreviewDateTime } from '@/utils/formatDateTime';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { Loader } from '@/components/common/Loader';
import { ThreadCard } from '@/components/teacher/threadList/ThreadCard';
import type { ThreadRoomItem } from '@/features/teacher/threadList/types';
import { ROUTES } from '@/constants/routes';
import { IcChat } from '@/icons';
import { apiClient } from '@/services/http/apiClient';

type InboxLoadState = 'loading' | 'error' | 'empty' | 'success';

type ChatRoomResponse = {
  chatRoomId: number;
  counterpartName: string;
  studentName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: InquiryStatusType;
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

const toThreadRoomItem = (room: ChatRoomResponse): ThreadRoomItem => {
  const intentType = getInquiryIntentByType(room.intentType);

  return {
    id: room.chatRoomId,
    counterpartName: room.counterpartName || '-',
    studentName: room.studentName || '-',
    preview: room.lastMessage || '-',
    timeText: formatMessagePreviewDateTime(room.lastMessageAt),
    unreadCount: room.unreadCount ?? 0,
    intentTag: {
      type: intentType,
      label: INQUIRY_INTENT_LABEL[intentType],
    },
    status: room.status,
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
      {loadState === 'loading' ? <Loader /> : null}

      {loadState === 'success' ? (
        <ThreadList>
          {rooms.map(room => {
            const currentStatus = statusByRoomId[room.id] ?? room.status;

            return (
              <ThreadCard
                key={room.id}
                room={room}
                currentStatus={currentStatus}
                onClick={() =>
                  navigate(ROUTES.teacherThreadDetail.replace(':threadId', String(room.id)))
                }
              />
            );
          })}
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

const ThreadListPageContainer = styled.section`
  padding: 16px 24px;
`;

const ThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EmptySection = styled.div`
  min-height: calc(100vh - 180px);
`;
