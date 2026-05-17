import { useMutation } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';

type AnalyzeTeacherMessageParams = {
  chatRoomId: number;
  content: string;
};

export const useAnalyzeTeacherMessage = () => {
  return useMutation({
    mutationFn: ({ chatRoomId, content }: AnalyzeTeacherMessageParams) => {
      return threadDetailApi.analyzeMessage(chatRoomId, content);
    },
  });
};
