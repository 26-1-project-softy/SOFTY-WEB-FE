import { useQuery } from '@tanstack/react-query';
import { tokenUsageQueryOptions } from '@/features/admin/aiModel/queries/tokenUsage';

export const useTokenUsage = () => {
  const { data, isLoading, isError, error } = useQuery(tokenUsageQueryOptions());

  return {
    tokenUsage: data ?? null,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : '',
  };
};
