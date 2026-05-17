export const threadQueryKeys = {
  all: ['teacher', 'threads'] as const,

  threadList: () => [...threadQueryKeys.all, 'list'] as const,

  detail: (chatRoomId: number) => [...threadQueryKeys.all, 'detail', chatRoomId] as const,

  messages: (chatRoomId: number) => [...threadQueryKeys.detail(chatRoomId), 'messages'] as const,
};
