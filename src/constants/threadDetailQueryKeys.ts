export const threadDetailQueryKeys = {
  all: ['teacher', 'threadDetail'] as const,

  detail: (chatRoomId: number) => [...threadDetailQueryKeys.all, chatRoomId, 'detail'] as const,

  messages: (chatRoomId: number) => [...threadDetailQueryKeys.all, chatRoomId, 'messages'] as const,

  threadList: () => ['teacher', 'threadList'] as const,
};
