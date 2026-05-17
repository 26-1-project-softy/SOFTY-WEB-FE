import { useMutation, useQueryClient } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import { threadDetailQueryKeys } from '@/constants/threadDetailQueryKeys';

export const useReadChatRoom = (chatRoomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => threadDetailApi.readRoom(chatRoomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: threadDetailQueryKeys.threadList(),
      });
    },
  });
};
