import { useQuery } from '@tanstack/react-query';
import { toThreadRoomItem } from '@/features/teacher/threadList/lib/toThreadRoomItem';
import { threadQueryKeys } from '@/constants/threadQueryKeys';
import { threadListApi } from '@/services/teacher/threadListApi';

const THREAD_ROOM_PAGE_SIZE = 20;

export const useThreadRoomsQuery = () => {
  return useQuery({
    queryKey: threadQueryKeys.threadList(),
    queryFn: async () => {
      const response = await threadListApi.getThreadRooms({
        size: THREAD_ROOM_PAGE_SIZE,
      });

      if (!response.success) {
        throw new Error(response.message || '대화 목록을 불러올 수 없어요.');
      }

      return response.data.content.map(toThreadRoomItem);
    },
  });
};
