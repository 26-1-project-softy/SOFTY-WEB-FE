import { useMutation, useQueryClient } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import { threadQueryKeys } from '@/constants/threadQueryKeys';
import type { SendTeacherMessageRequest } from '@/features/teacher/threadDetail/types';

type SendTeacherMessageParams = {
  chatRoomId: number;
  payload: SendTeacherMessageRequest;
};

export const useSendTeacherMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatRoomId, payload }: SendTeacherMessageParams) => {
      return threadDetailApi.sendMessage(chatRoomId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: threadQueryKeys.threadList(),
      });
    },
  });
};
