import { useQuery } from '@tanstack/react-query';
import { teacherApi, type TeacherSetting } from '@/services/teacher/teacherApi';
import { teacherSettingsQueryKeys } from '@/features/teacher/settings/constants/teacherSettingsQueryKeys';

const getTeacherSettingErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return '잠시 후 다시 시도해주세요.';
};

export const useTeacherSettingQuery = () => {
  const query = useQuery<TeacherSetting>({
    queryKey: teacherSettingsQueryKeys.detail(),
    queryFn: teacherApi.getTeacherSetting,
  });

  return {
    ...query,
    errorMessage: query.isError ? getTeacherSettingErrorMessage(query.error) : '',
  };
};
