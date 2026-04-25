import type { AuthRole } from '@/stores/authStore';
import type { IconComponent } from '@/types/icon';
import { ROUTES } from '@/constants/routes';
import { IcInbox, IcReport, IcSettings, IcDashboard, IcErrorReview, IcModel } from '@/icons';

export type NavigationItem = {
  label: string;
  icon: IconComponent;
  path: string;
};

export const NAVIGATION_BY_ROLE: Record<Exclude<AuthRole, null>, NavigationItem[]> = {
  teacher: [
    { label: '수신함', icon: IcInbox, path: ROUTES.teacherThreadList },
    { label: '증빙 리포트', icon: IcReport, path: ROUTES.teacherReports },
    { label: '설정', icon: IcSettings, path: ROUTES.teacherSettings },
  ],
  admin: [
    { label: '대시보드', icon: IcDashboard, path: ROUTES.adminDashboard },
    { label: '오류 검토', icon: IcErrorReview, path: ROUTES.adminErrorReview },
    { label: 'AI 모델 관리', icon: IcModel, path: ROUTES.adminAiModel },
  ],
};
