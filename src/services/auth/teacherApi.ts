import { apiClient } from '@/services/http/apiClient';

export type TeacherSignUpRequest = {
  teacherName: string;
  schoolName: string;
  grade: number;
  classNumber: number;
};

export type TeacherSignUpResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    userId: number;
    role: string;
  };
};

export const teacherApi = {
  signUp: async (payload: TeacherSignUpRequest) => {
    const { data } = await apiClient.post<TeacherSignUpResponse>('/auth/teachers/signup', payload);

    return data;
  },
};
