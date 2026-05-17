import { useQuery } from '@tanstack/react-query';
import { threadQueryKeys } from '@/constants/threadQueryKeys';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';

export const useChatRoomDetailQuery = (chatRoomId: number) => {
  const isValidChatRoomId = Number.isFinite(chatRoomId) && chatRoomId > 0;

  return useQuery({
    queryKey: threadQueryKeys.detail(chatRoomId),
    enabled: isValidChatRoomId,
    queryFn: async () => {
      const response = await threadDetailApi.getChatRoomDetail(chatRoomId);
      const payload = response.data;

      if (!payload) {
        throw new Error('채팅방 데이터가 없습니다.');
      }

      return payload;
    },
  });
};
