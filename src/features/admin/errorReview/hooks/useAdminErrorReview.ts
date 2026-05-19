import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getErrorReviewItem } from '@/features/admin/errorReview/lib/getErrorReviewItem';
import { errorReviewApi } from '@/services/admin/errorReviewApi';
import {
  ERROR_REVIEW_DEFAULT_EXPANDED_ID,
  ERROR_REVIEW_DEFAULT_FILTERS,
  ERROR_REVIEW_DEFAULT_QUERY_PARAMS,
  ERROR_REVIEW_QUERY_KEY,
} from '@/features/admin/errorReview/constants';
import type { AdminRiskFeedbackFilterValues } from '@/features/admin/errorReview/types';

const normalizeFilterParams = (filters: AdminRiskFeedbackFilterValues) => ({
  riskLevel: filters.riskLevel === 'ALL' ? undefined : filters.riskLevel,
  feedbackResult: filters.feedbackResult === 'ALL' ? undefined : filters.feedbackResult,
  teacherName: filters.teacherName.trim() ? filters.teacherName.trim() : undefined,
  startDate: filters.startDate || undefined,
  endDate: filters.endDate || undefined,
});

export const useAdminErrorReview = () => {
  const [page, setPage] = useState(ERROR_REVIEW_DEFAULT_QUERY_PARAMS.page);
  const [size] = useState(ERROR_REVIEW_DEFAULT_QUERY_PARAMS.size);
  const [draftFilters, setDraftFilters] = useState<AdminRiskFeedbackFilterValues>(
    ERROR_REVIEW_DEFAULT_FILTERS
  );
  const [appliedFilters, setAppliedFilters] = useState<AdminRiskFeedbackFilterValues>(
    ERROR_REVIEW_DEFAULT_FILTERS
  );
  const [expandedId, setExpandedId] = useState<number>(ERROR_REVIEW_DEFAULT_EXPANDED_ID);

  const normalizedFilters = normalizeFilterParams(appliedFilters);

  const query = useQuery({
    queryKey: [
      ...ERROR_REVIEW_QUERY_KEY,
      page,
      size,
      normalizedFilters.riskLevel ?? 'ALL',
      normalizedFilters.feedbackResult ?? 'ALL',
      normalizedFilters.teacherName ?? '',
      normalizedFilters.startDate ?? '',
      normalizedFilters.endDate ?? '',
    ],
    queryFn: async () => {
      const response = await errorReviewApi.getRiskFeedbacks({
        page,
        size,
        ...normalizedFilters,
      });

      if (!response.success) {
        throw new Error(response.message || '오류 검토 목록 조회에 실패했습니다.');
      }

      return response.data;
    },
    staleTime: 1000 * 60,
  });

  const items = query.data?.items?.map(getErrorReviewItem) ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const totalElements = query.data?.totalElements ?? 0;

  const handleToggle = (id: number) => {
    setExpandedId(prev => (prev === id ? 0 : id));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setDraftFilters(ERROR_REVIEW_DEFAULT_FILTERS);
    setAppliedFilters(ERROR_REVIEW_DEFAULT_FILTERS);
    setPage(1);
  };

  return {
    items,
    page,
    size,
    totalPages,
    totalElements,
    draftFilters,
    setDraftFilters,
    setPage,
    handleApplyFilters,
    handleResetFilters,
    expandedId,
    handleToggle,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
