import { apiClient } from '@/services/http/apiClient';

export type MeResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    role: string;
    name: string;
    grade: number | null;
    class: number | null;
  };
  role?: string;
  name?: string;
  grade?: number | null;
  class?: number | null;
};

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

const normalizeRole = (role: string): 'teacher' | 'admin' => {
  const normalized = role.toLowerCase();

  if (normalized === 'teacher' || normalized === 'admin') {
    return normalized;
  }

  throw new Error('Unsupported user role');
};

export const authApi = {
  getMe: async (accessToken?: string) => {
    const { data } = await apiClient.get<MeResponse>('/users/me', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    const me = data.data ?? data;

    if (!me.role || !me.name) {
      throw new Error('Invalid user profile response');
    }

    return {
      role: normalizeRole(me.role),
      user: {
        name: me.name,
        grade: me.grade ?? undefined,
        classNumber: me.class ?? undefined,
      },
    };
  },
  getTeacherSetting: async () => {
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
  },
};
