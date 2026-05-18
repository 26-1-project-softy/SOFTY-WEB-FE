import { apiClient } from '@/services/http/apiClient';
import type { ApiResponse } from '@/types/apiResponse';
import type {
  AdminRiskFeedbackListData,
  AdminRiskFeedbackListParams,
} from '@/features/admin/errorReview/types';

export const errorReviewApi = {
  getRiskFeedbacks: async (params: AdminRiskFeedbackListParams) => {
    const { data } = await apiClient.get<ApiResponse<AdminRiskFeedbackListData>>(
      '/admin/risk-feedbacks',
      {
        params,
      }
    );

    return data;
  },
};
