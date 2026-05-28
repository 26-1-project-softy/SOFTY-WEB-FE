import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi, type TeacherSetting } from '@/services/teacher/teacherApi';
import { teacherSettingsQueryKeys } from '@/features/teacher/settings/constants/teacherSettingsQueryKeys';

type ChangeTeacherClassVariables = {
  schoolName: string;
  grade: number;
  class: number;
};

export const useChangeClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: ChangeTeacherClassVariables) =>
      teacherApi.changeTeacherClass(variables),
    onSuccess: (response, variables) => {
      if (!response.success) {
        return;
      }

      queryClient.setQueryData<TeacherSetting | undefined>(
        teacherSettingsQueryKeys.detail(),
        previousSetting => {
          if (!previousSetting) {
            return previousSetting;
          }

          return {
            ...previousSetting,
            schoolName: variables.schoolName,
            grade: variables.grade,
            classNumber: variables.class,
            classCode: response.classCode || previousSetting.classCode,
          };
        }
      );
    },
  });
};
