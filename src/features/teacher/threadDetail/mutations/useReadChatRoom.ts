import { useMutation, useQueryClient } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import { threadQueryKeys } from '@/constants/threadQueryKeys';

export const useReadChatRoom = (chatRoomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => threadDetailApi.readRoom(chatRoomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: threadQueryKeys.threadList(),
      });
    },
  });
};
