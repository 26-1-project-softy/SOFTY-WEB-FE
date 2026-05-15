import { useQuery } from '@tanstack/react-query';
import { latestModelInfoQueryOptions } from '@/features/admin/aiModel/queries/modelInfo';

export const useLatestModelInfo = () => {
  const { data, isLoading, isError, error } = useQuery(latestModelInfoQueryOptions());

  return {
    modelInfo: data ?? null,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : '',
  };
};
