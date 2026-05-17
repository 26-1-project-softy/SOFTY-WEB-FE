import { useMutation, useQueryClient } from '@tanstack/react-query';
import { threadQueryKeys } from '@/constants/threadQueryKeys';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import type { ThreadStatus } from '@/stores/threadStatusStore';

type UpdateChatRoomStatusParams = {
  chatRoomId: number;
  status: ThreadStatus;
};

export const useUpdateChatRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatRoomId, status }: UpdateChatRoomStatusParams) => {
      return threadDetailApi.updateStatus(chatRoomId, status);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: threadQueryKeys.detail(variables.chatRoomId),
      });

      void queryClient.invalidateQueries({
        queryKey: threadQueryKeys.threadList(),
      });
    },
  });
};
