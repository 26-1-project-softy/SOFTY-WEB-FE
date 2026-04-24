import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { IcBack, IcHome } from '@/icons';
import { AppLayout } from '@/layouts/AppLayout';
import { AdminAiModelPage } from '@/pages/admin/aiModel/AdminAiModelPage';
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage';
import { AdminErrorReviewPage } from '@/pages/admin/errorReview/AdminErrorReviewPage';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';
import { LandingPage } from '@/pages/auth/LandingPage';
import { TeacherSignUpPage } from '@/pages/auth/TeacherSignUpPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { TeacherReportsPage } from '@/pages/teacher/reports/TeacherReportsPage';
import { TeacherSettingsPage } from '@/pages/teacher/settings/TeacherSettingsPage';
import { TeacherThreadDetailPage } from '@/pages/teacher/threadDetail/TeacherThreadDetailPage';
import { TeacherThreadListPage } from '@/pages/teacher/threadList/TeacherThreadListPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

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
            element: <Navigate to="thread-list" />,
          },
          {
            path: 'thread-list',
            element: <TeacherThreadListPage />,
            handle: {
              title: '\uC218\uC2E0\uD568',
            },
          },
          {
            path: 'thread-detail/:threadId',
            element: <TeacherThreadDetailPage />,
            handle: null,
          },
          {
            path: 'reports',
            element: <TeacherReportsPage />,
            handle: {
              title: '\uC99D\uBE59 \uB9AC\uD3EC\uD2B8',
            },
          },
          {
            path: 'settings',
            element: <TeacherSettingsPage />,
            handle: {
              title: '\uC124\uC815',
            },
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
              title: '\uB300\uC2DC\uBCF4\uB4DC',
            },
          },
          {
            path: 'error-review',
            element: <AdminErrorReviewPage />,
            handle: {
              title: '\uC624\uB958 \uAC80\uD1A0',
            },
          },
          {
            path: 'ai-model',
            element: <AdminAiModelPage />,
            handle: {
              title: 'AI \uBAA8\uB378 \uAD00\uB9AC',
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
        description={`\uAD8C\uD55C\uC774 \uC5C6\uAC70\uB098, \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uB294 \uD398\uC774\uC9C0\uC608\uC694.\n\uB85C\uADF8\uC778 \uC815\uBCF4\uB97C \uB2E4\uC2DC \uD55C \uBC88 \uD655\uC778\uD574\uC8FC\uC138\uC694.`}
        primaryBtnLabel="\uD648\uC73C\uB85C \uC774\uB3D9"
        primaryBtnIcon={IcHome}
        primaryTo={ROUTES.root}
        ghostBtnLabel="\uC774\uC804\uC73C\uB85C"
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
        description={`\uD398\uC774\uC9C0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694.\n\uC8FC\uC18C\uAC00 \uC798\uBABB\uB418\uC5C8\uAC70\uB098, \uC0AD\uC81C\uB418\uC5C8\uC744 \uC218 \uC788\uC5B4\uC694.`}
        primaryBtnLabel="\uD648\uC73C\uB85C \uC774\uB3D9"
        primaryBtnIcon={IcHome}
        primaryTo={ROUTES.root}
      />
    ),
  },
]);
