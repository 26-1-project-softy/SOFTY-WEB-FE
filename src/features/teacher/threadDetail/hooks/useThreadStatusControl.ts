import { useCallback, useState } from 'react';
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
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ThreadStatus | null>(null);

  const overriddenStatus = useThreadStatusStore(state => state.statusByRoomId[chatRoomId]);
  const setRoomStatus = useThreadStatusStore(state => state.setRoomStatus);
  const updateChatRoomStatusMutation = useUpdateChatRoomStatus();

  const status = overriddenStatus ?? serverStatus ?? INQUIRY_STATUS.IN_PROGRESS;
  const isStatusConfirmDialogOpen = pendingStatus === INQUIRY_STATUS.COMPLETED;

  const updateStatus = useCallback(
    async (nextStatus: ThreadStatus) => {
      if (updateChatRoomStatusMutation.isPending) {
        return;
      }

      const previousStatus = status;

      const rollbackStatus = () => {
        setRoomStatus(chatRoomId, previousStatus);
      };

      setRoomStatus(chatRoomId, nextStatus);
      setIsStatusMenuOpen(false);

      if (!isValidChatRoomId) {
        rollbackStatus();
        return;
      }

      try {
        const response = await updateChatRoomStatusMutation.mutateAsync({
          chatRoomId,
          status: nextStatus,
        });

        if (!response.success) {
          rollbackStatus();
        }
      } catch {
        rollbackStatus();
      }
    },
    [chatRoomId, isValidChatRoomId, setRoomStatus, status, updateChatRoomStatusMutation]
  );

  const handleSelectStatus = useCallback(
    (nextStatus: ThreadStatus) => {
      if (updateChatRoomStatusMutation.isPending || nextStatus === status) {
        setIsStatusMenuOpen(false);
        return;
      }

      if (nextStatus === INQUIRY_STATUS.COMPLETED && status !== INQUIRY_STATUS.COMPLETED) {
        setPendingStatus(nextStatus);
        setIsStatusMenuOpen(false);
        return;
      }

      void updateStatus(nextStatus);
    },
    [status, updateChatRoomStatusMutation.isPending, updateStatus]
  );

  const handleCloseStatusConfirmDialog = useCallback(() => {
    setPendingStatus(null);
  }, []);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!pendingStatus) {
      return;
    }

    const nextStatus = pendingStatus;

    setPendingStatus(null);
    await updateStatus(nextStatus);
  }, [pendingStatus, updateStatus]);

  return {
    status,
    isStatusMenuOpen,
    isStatusUpdating: updateChatRoomStatusMutation.isPending,
    isStatusConfirmDialogOpen,

    setIsStatusMenuOpen,
    handleSelectStatus,
    handleCloseStatusConfirmDialog,
    handleConfirmStatusChange,
  };
};
