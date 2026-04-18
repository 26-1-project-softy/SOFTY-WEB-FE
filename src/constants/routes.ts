export const ROUTES = {
  root: '/',
  landing: '/landing',

  adminLogin: '/admin/login',
  teacherSignUp: '/teacher/signup',
  teacherKakaoCallback: '/auth/teacher/kakao/callback',
  inbox: '/inbox',

  teacher: '/teacher',
  teacherThreadList: '/teacher/thread-list',
  teacherThreadDetail: '/teacher/thread-detail/:threadId',
  teacherReports: '/teacher/reports',
  teacherSettings: '/teacher/settings',

  admin: '/admin',
  adminDashboard: '/admin/dashboard',
  adminAiModel: '/admin/ai-model',
  adminErrorReview: '/admin/error-review',

  forbidden: '/forbidden',
  notFound: '*',
} as const;
