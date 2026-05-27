import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useThreadStatusStore } from '@/stores/threadStatusStore';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { Loader } from '@/components/common/Loader';
import { ThreadCard } from '@/components/teacher/threadList/ThreadCard';
import { useThreadRoomsQuery } from '@/features/teacher/threadList/queries/useThreadRoomsQuery';
import { ROUTES } from '@/constants/routes';
import { IcChat } from '@/icons';

export const TeacherThreadListPage = () => {
  const navigate = useNavigate();
  const statusByRoomId = useThreadStatusStore(state => state.statusByRoomId);

  const { data: rooms = [], isLoading, isError, refetch } = useThreadRoomsQuery();

  const handleThreadCardClick = (roomId: number) => {
    navigate(ROUTES.teacherThreadDetail.replace(':threadId', String(roomId)));
  };

  const renderThreadListContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (isError) {
      return (
        <SectionErrorState
          onRetry={() => void refetch()}
          title="대화 목록을 불러올 수 없어요"
          description="잠시 후 다시 시도해주세요."
        />
      );
    }

    if (rooms.length === 0) {
      return (
        <SectionEmptyState
          icon={IcChat}
          title="표시할 대화 목록이 없어요"
          description="새 메시지가 오면 이곳에 채팅방이 표시됩니다."
        />
      );
    }

    return (
      <ThreadList>
        {rooms.map(room => {
          const currentStatus = statusByRoomId[room.id] ?? room.status;

          return (
            <ThreadCard
              key={room.id}
              room={room}
              currentStatus={currentStatus}
              onClick={() => handleThreadCardClick(room.id)}
            />
          );
        })}
      </ThreadList>
    );
  };

  return <ThreadListPageContainer>{renderThreadListContent()}</ThreadListPageContainer>;
};

const ThreadListPageContainer = styled.section`
  height: 100%;
  padding: 16px 24px;
`;

const ThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
