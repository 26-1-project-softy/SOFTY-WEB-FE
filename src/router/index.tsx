import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/auth/LandingPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';
import { TeacherSignUpPage } from '@/pages/auth/TeacherSignUpPage';
import { AdminAiModelPage } from '@/pages/admin/aiModel/AdminAiModelPage';
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage';
import { TeacherReportsPage } from '@/pages/teacher/reports/TeacherReportsPage';
import { AdminErrorReviewPage } from '@/pages/admin/errorReview/AdminErrorReviewPage';
import { TeacherSettingsPage } from '@/pages/teacher/settings/TeacherSettingsPage';
import { TeacherThreadDetailPage } from '@/pages/teacher/threadDetail/TeacherThreadDetailPage';
import { TeacherThreadListPage } from '@/pages/teacher/threadList/TeacherThreadListPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { ROUTES } from '@/constants/routes';
import { IcBack, IcHome } from '@/icons';

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: ROUTES.root,
        element: <LandingPage />,
      },
      {
        path: ROUTES.adminLogin,
        element: <AdminLoginPage />,
      },
      {
        path: ROUTES.teacherSignUp,
        element: <TeacherSignUpPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['teacher']} />,
    children: [
      {
        path: ROUTES.teacher,
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="threadList" />,
          },
          {
            path: 'threadList',
            element: <TeacherThreadListPage />,
            handle: {
              title: '수신함',
            },
          },
          {
            path: 'threadDetail/:threadId',
            element: <TeacherThreadDetailPage />,
            handle: null,
          },
          {
            path: 'reports',
            element: <TeacherReportsPage />,
            handle: {
              title: '증빙 리포트',
            },
          },
          {
            path: 'settings',
            element: <TeacherSettingsPage />,
            handle: null,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: ROUTES.admin,
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" />,
          },
          {
            path: 'dashboard',
            element: <AdminDashboardPage />,
            handle: {
              title: '대시보드',
            },
          },
          {
            path: 'errorReview',
            element: <AdminErrorReviewPage />,
            handle: {
              title: '오류 검토',
            },
          },
          {
            path: 'aiModel',
            element: <AdminAiModelPage />,
            handle: {
              title: 'AI 모델 관리',
            },
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.forbidden,
    element: (
      <ErrorPage
        title="403 Forbidden"
        description={`권한이 없거나, 사용할 수 없는 페이지예요.\n로그인 정보를 다시 한 번 확인해주세요.`}
        primaryBtnLabel="홈으로 이동"
        primaryBtnIcon={IcHome}
        primaryTo={ROUTES.root}
        ghostBtnLabel="이전으로"
        ghostBtnIcon={IcBack}
        isGhostGoBack
      />
    ),
  },
  {
    path: ROUTES.notFound,
    element: (
      <ErrorPage
        title="404 Not Found"
        description={`페이지를 찾을 수 없어요.\n주소가 잘못되었거나, 삭제되었을 수 있어요.`}
        primaryBtnLabel="홈으로 이동"
        primaryBtnIcon={IcHome}
        primaryTo={ROUTES.root}
      />
    ),
  },
]);
