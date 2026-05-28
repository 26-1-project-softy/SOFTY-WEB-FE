export const teacherSettingsQueryKeys = {
  all: ['teacher', 'settings'] as const,
  detail: () => [...teacherSettingsQueryKeys.all, 'detail'] as const,
};
