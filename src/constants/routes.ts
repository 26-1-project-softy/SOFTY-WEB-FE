export const ROUTES = {
  root: '/',

  adminLogin: '/admin/login',
  teacherSignUp: '/teacher/signup',
  teacherKakaoCallback: '/oauth/kakao/callback',

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
