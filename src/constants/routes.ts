export const ROUTES = {
  root: '/',

  adminLogin: '/admin/login',
  teacherSignUp: '/teacher/signup',

  teacher: '/teacher',
  teacherThreadList: '/teacher/threadList',
  teacherThreadDetail: '/teacher/threadDetail/:threadId',
  teacherReports: '/teacher/reports',
  teacherSettings: '/teacher/settings',

  admin: '/admin',
  adminDashboard: '/admin/dashboard',
  adminAiModel: '/admin/aiModel',
  adminErrorReview: '/admin/errorReview',

  forbidden: '/forbidden',
  notFound: '*',
} as const;
