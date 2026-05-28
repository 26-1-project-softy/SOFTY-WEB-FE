import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@/services/teacher/teacherApi';
import { teacherSettingsQueryKeys } from '@/features/teacher/settings/constants/teacherSettingsQueryKeys';

type ChangeTeacherWorkHoursVariables = Parameters<typeof teacherApi.changeTeacherWorkHours>[0];

export const useChangeWorkHoursMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: ChangeTeacherWorkHoursVariables) =>
      teacherApi.changeTeacherWorkHours(variables),
    onSuccess: response => {
      if (!response.success) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: teacherSettingsQueryKeys.detail(),
      });
    },
  });
};
