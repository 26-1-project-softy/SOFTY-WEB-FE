import { apiClient } from '@/services/http/apiClient';

export type TeacherSettingScheduleResponse = {
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
};

export type TeacherSettingResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    grade: number | null;
    class: number | null;
    schoolName: string | null;
    classCode: string | null;
    teacherName: string | null;
    schedules: TeacherSettingScheduleResponse[] | null;
  } | null;
};

export type TeacherSetting = {
  grade: number | null;
  classNumber: number | null;
  schoolName: string;
  classCode: string;
  teacherName: string;
  schedules: TeacherSettingScheduleResponse[];
};

export type ChangeTeacherClassRequest = {
  schoolName: string;
  grade: number;
  class: number;
};

export type ChangeTeacherClassResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    classCode?: string | null;
  } | null;
};

export type ChangeTeacherWorkHoursRequest = {
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
};

export type ChangeTeacherWorkHoursResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: null;
};

export const getTeacherSetting = async () => {
  const { data } = await apiClient.get<TeacherSettingResponse>('/teachers/setting');
  const setting = data.data;

  return {
    grade: setting?.grade ?? null,
    classNumber: setting?.class ?? null,
    schoolName: setting?.schoolName ?? '',
    classCode: setting?.classCode ?? '',
    teacherName: setting?.teacherName ?? '',
    schedules: setting?.schedules ?? [],
  } satisfies TeacherSetting;
};

export const changeTeacherClass = async (payload: ChangeTeacherClassRequest) => {
  const { data } = await apiClient.patch<ChangeTeacherClassResponse>('/teachers/me/class', payload);

  return {
    success: data.success,
    message: data.message,
    classCode: data.data?.classCode ?? '',
  };
};

export const changeTeacherWorkHours = async (payload: ChangeTeacherWorkHoursRequest) => {
  const { data } = await apiClient.patch<ChangeTeacherWorkHoursResponse>(
    '/teachers/me/work-hours',
    payload
  );

  return {
    success: data.success,
    code: data.code,
    message: data.message,
  };
};

export const teacherApi = {
  getTeacherSetting,
  changeTeacherClass,
  changeTeacherWorkHours,
};
