export { adminAuthApi } from '@/services/auth/adminAuthApi';
export type { AdminLoginRequest, AdminLoginResponse } from '@/services/auth/adminAuthApi';

export { teacherAuthApi } from '@/services/auth/teacherAuthApi';
export type {
  TeacherSignUpRequest,
  TeacherSignUpResponse,
  TeacherKakaoLoginRequest,
  TeacherKakaoLoginResponse,
} from '@/services/auth/teacherAuthApi';

export { userAuthApi } from '@/services/auth/userAuthApi';
export type { DeleteMeResponse } from '@/services/auth/userAuthApi';

export { authApi } from '@/services/auth/authApi';
export { authSession } from '@/services/auth/authSession';
