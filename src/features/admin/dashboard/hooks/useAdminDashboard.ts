import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/admin/dashboardApi';
import type { DashboardTab } from '@/features/admin/dashboard/types/dashboard';

const DASHBOARD_QUERY_KEYS = {
  recommendation: ['admin', 'dashboard', 'recommendation'],
  risk: ['admin', 'dashboard', 'risk'],
  pdf: ['admin', 'dashboard', 'pdf'],
} as const;

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('recommendation');

  const recommendationQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recommendation,
    queryFn: dashboardApi.getRecommendationStatistics,
    enabled: activeTab === 'recommendation',
    staleTime: 1000 * 60 * 5,
  });

  const riskQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.risk,
    queryFn: dashboardApi.getRiskStatistics,
    enabled: activeTab === 'risk',
    staleTime: 1000 * 60 * 5,
  });

  const pdfQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.pdf,
    queryFn: dashboardApi.getPdfStatistics,
    enabled: activeTab === 'pdf',
    staleTime: 1000 * 60 * 5,
  });

  const currentQuery = useMemo(() => {
    if (activeTab === 'recommendation') {
      return recommendationQuery;
    }

    if (activeTab === 'risk') {
      return riskQuery;
    }

    return pdfQuery;
  }, [activeTab, recommendationQuery, riskQuery, pdfQuery]);

  return {
    activeTab,
    setActiveTab,
    recommendationData: recommendationQuery.data,
    riskData: riskQuery.data,
    pdfData: pdfQuery.data,
    isCurrentTabLoading: currentQuery.isLoading,
    isCurrentTabError: currentQuery.isError,
    refetchCurrentTab: currentQuery.refetch,
  };
};
