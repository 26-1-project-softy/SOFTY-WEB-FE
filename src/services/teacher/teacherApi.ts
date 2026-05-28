import { apiClient } from '@/services/http/apiClient';

export type TeacherSettingSchedule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type TeacherSetting = {
  grade: number;
  class: number;
  schoolName: string;
  classCode: string;
  teacherName: string;
  schedules: TeacherSettingSchedule[];
};

export type TeacherSettingResponse = {
  success: boolean;
  code: number;
  message: string;
  data: TeacherSetting;
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
  classCode?: string;
  data?: {
    classCode?: string;
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
  data?: Record<string, never> | null;
};

export const teacherApi = {
  getTeacherSetting: async () => {
    const { data } = await apiClient.get<TeacherSettingResponse>('/teachers/setting');

    if (!data.success || !data.data) {
      throw new Error(data.message || '설정 정보를 불러오지 못했어요.');
    }

    return data.data;
  },

  changeTeacherClass: async (payload: ChangeTeacherClassRequest) => {
    const { data } = await apiClient.patch<ChangeTeacherClassResponse>('/teachers/class', payload);

    return data;
  },

  changeTeacherWorkHours: async (payload: ChangeTeacherWorkHoursRequest) => {
    const { data } = await apiClient.patch<ChangeTeacherWorkHoursResponse>(
      '/teachers/me/work-hours',
      payload
    );

    return data;
  },
};
