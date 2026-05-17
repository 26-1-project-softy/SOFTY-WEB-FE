import { useCallback, useEffect, useState } from 'react';
import { INQUIRY_STATUS } from '@/constants/inquiryStatus';
import { useUpdateChatRoomStatus } from '@/features/teacher/threadDetail/mutations';
import { useThreadStatusStore, type ThreadStatus } from '@/stores/threadStatusStore';

type UseThreadStatusControlParams = {
  chatRoomId: number;
  isValidChatRoomId: boolean;
  serverStatus?: ThreadStatus;
};

export const useThreadStatusControl = ({
  chatRoomId,
  isValidChatRoomId,
  serverStatus,
}: UseThreadStatusControlParams) => {
  const [status, setStatus] = useState<ThreadStatus>(INQUIRY_STATUS.IN_PROGRESS);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const setRoomStatus = useThreadStatusStore(state => state.setRoomStatus);
  const updateChatRoomStatusMutation = useUpdateChatRoomStatus();

  useEffect(() => {
    if (!serverStatus) {
      return;
    }

    const overriddenStatus = useThreadStatusStore.getState().statusByRoomId[chatRoomId];
    const nextStatus = overriddenStatus ?? serverStatus;

    setStatus(nextStatus);

    if (!overriddenStatus) {
      setRoomStatus(chatRoomId, serverStatus);
    }
  }, [chatRoomId, serverStatus, setRoomStatus]);

  const handleSelectStatus = useCallback(
    async (nextStatus: ThreadStatus) => {
      if (updateChatRoomStatusMutation.isPending) {
        return;
      }

      const previousStatus = status;

      setStatus(nextStatus);
      setRoomStatus(chatRoomId, nextStatus);
      setIsStatusMenuOpen(false);

      if (!isValidChatRoomId) {
        return;
      }

      try {
        const response = await updateChatRoomStatusMutation.mutateAsync({
          chatRoomId,
          status: nextStatus,
        });

        if (!response.success) {
          throw new Error(response.message || '처리 상태 변경에 실패했어요');
        }
      } catch {
        setStatus(previousStatus);
        setRoomStatus(chatRoomId, previousStatus);
      }
    },
    [chatRoomId, isValidChatRoomId, setRoomStatus, status, updateChatRoomStatusMutation]
  );

  return {
    status,
    isStatusMenuOpen,
    isStatusUpdating: updateChatRoomStatusMutation.isPending,
    setIsStatusMenuOpen,
    handleSelectStatus,
  };
};
