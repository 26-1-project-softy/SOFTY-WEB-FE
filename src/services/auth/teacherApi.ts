import { apiClient } from '@/services/http/apiClient';

export type TeacherSignUpRequest = {
  kakaoAccessToken: string;
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
    const { kakaoAccessToken, ...body } = payload;

    const { data } = await apiClient.post<TeacherSignUpResponse>('/auth/teachers/signup', body, {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    });

    return data;
  },
};
