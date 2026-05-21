import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getErrorReviewItem } from '@/features/admin/errorReview/lib/getErrorReviewItem';
import { errorReviewApi } from '@/services/admin/errorReviewApi';
import {
  ERROR_REVIEW_ALL_VALUE,
  ERROR_REVIEW_COLLAPSED_ID,
  ERROR_REVIEW_DEFAULT_EXPANDED_ID,
  ERROR_REVIEW_DEFAULT_FILTERS,
  ERROR_REVIEW_DEFAULT_QUERY_PARAMS,
  ERROR_REVIEW_EMPTY_VALUE,
  ERROR_REVIEW_FALLBACK_ERROR_MESSAGE,
  ERROR_REVIEW_QUERY_KEY,
  ERROR_REVIEW_QUERY_STALE_TIME_MS,
} from '@/features/admin/errorReview/constants';
import type { AdminRiskFeedbackFilterValues } from '@/features/admin/errorReview/types';

const normalizeFilterParams = (filters: AdminRiskFeedbackFilterValues) => {
  const normalizedStartDate = filters.startDate || undefined;
  const normalizedEndDate = filters.endDate || undefined;

  return {
    riskLevel: filters.riskLevel === ERROR_REVIEW_ALL_VALUE ? undefined : filters.riskLevel,
    feedbackResult:
      filters.feedbackResult === ERROR_REVIEW_ALL_VALUE ? undefined : filters.feedbackResult,
    teacherName: filters.teacherName.trim() ? filters.teacherName.trim() : undefined,
    startDate: normalizedStartDate,
    // If only one date is selected, treat it as a single-day query.
    endDate: normalizedEndDate ?? normalizedStartDate,
  };
};

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
      normalizedFilters.riskLevel ?? ERROR_REVIEW_ALL_VALUE,
      normalizedFilters.feedbackResult ?? ERROR_REVIEW_ALL_VALUE,
      normalizedFilters.teacherName ?? ERROR_REVIEW_EMPTY_VALUE,
      normalizedFilters.startDate ?? ERROR_REVIEW_EMPTY_VALUE,
      normalizedFilters.endDate ?? ERROR_REVIEW_EMPTY_VALUE,
    ],
    queryFn: async () => {
      const response = await errorReviewApi.getRiskFeedbacks({
        page,
        size,
        ...normalizedFilters,
      });

      if (!response.success) {
        throw new Error(response.message || ERROR_REVIEW_FALLBACK_ERROR_MESSAGE);
      }

      return response.data;
    },
    staleTime: ERROR_REVIEW_QUERY_STALE_TIME_MS,
  });

  const items = query.data?.items?.map(getErrorReviewItem) ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const totalElements = query.data?.totalElements ?? 0;

  const handleToggle = (id: number) => {
    setExpandedId(prev => (prev === id ? ERROR_REVIEW_COLLAPSED_ID : id));
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
