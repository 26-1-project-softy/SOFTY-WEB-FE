import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainingHistoryQueryOptions } from '@/features/admin/aiModel/queries/trainingHistory';

const TRAINING_HISTORY_PAGE_SIZE = 10;

export const useTrainingHistory = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery(
    trainingHistoryQueryOptions(page, TRAINING_HISTORY_PAGE_SIZE)
  );

  const totalPages = data?.totalPages ?? 0;

  const handleClickPrevPage = () => {
    setPage(currentPage => Math.max(1, currentPage - 1));
  };

  const handleClickNextPage = () => {
    setPage(currentPage => Math.min(totalPages, currentPage + 1));
  };

  return {
    trainingHistory: data ?? null,
    trainingHistoryList: data?.items ?? [],
    page,
    totalPages,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : '',
    hasPrevPage: page > 1,
    hasNextPage: totalPages > 0 && page < totalPages,
    handleClickPrevPage,
    handleClickNextPage,
    refetch,
  };
};
