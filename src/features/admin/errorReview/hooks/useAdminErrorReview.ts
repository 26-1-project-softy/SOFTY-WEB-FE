import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getErrorReviewItem } from '@/features/admin/errorReview/lib/getErrorReviewItem';
import { errorReviewApi } from '@/services/admin/errorReviewApi';
import {
  ERROR_REVIEW_DEFAULT_EXPANDED_ID,
  ERROR_REVIEW_DEFAULT_QUERY_PARAMS,
  ERROR_REVIEW_QUERY_KEY,
} from '@/features/admin/errorReview/constants';

export const useAdminErrorReview = () => {
  const [page] = useState(ERROR_REVIEW_DEFAULT_QUERY_PARAMS.page);
  const [size] = useState(ERROR_REVIEW_DEFAULT_QUERY_PARAMS.size);
  const [expandedId, setExpandedId] = useState<number>(ERROR_REVIEW_DEFAULT_EXPANDED_ID);

  const query = useQuery({
    queryKey: [...ERROR_REVIEW_QUERY_KEY, page, size],
    queryFn: async () => {
      const response = await errorReviewApi.getRiskFeedbacks({ page, size });

      if (!response.success) {
        throw new Error(response.message || '오류 검토 목록 조회에 실패했습니다.');
      }

      return response.data;
    },
    staleTime: 1000 * 60,
  });

  const items = query.data?.items?.map(getErrorReviewItem) ?? [];

  const handleToggle = (id: number) => {
    setExpandedId(prev => (prev === id ? 0 : id));
  };

  return {
    items,
    expandedId,
    handleToggle,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
