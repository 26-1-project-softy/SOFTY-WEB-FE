import { useMutation } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';

type RecheckTeacherMessageParams = {
  analysisId: number;
  content: string;
};

export const useRecheckTeacherMessage = () => {
  return useMutation({
    mutationFn: ({ analysisId, content }: RecheckTeacherMessageParams) => {
      return threadDetailApi.recheckMessage(analysisId, content);
    },
  });
};
