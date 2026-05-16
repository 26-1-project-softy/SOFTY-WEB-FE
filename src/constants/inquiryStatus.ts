import type { ColorsType } from '@/styles/colors';

export const INQUIRY_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type InquiryStatusType = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];

export const INQUIRY_STATUS_LABEL: Record<InquiryStatusType, string> = {
  IN_PROGRESS: '처리중',
  COMPLETED: '처리완료',
};

export const INQUIRY_STATUS_COLOR_KEY: Record<InquiryStatusType, keyof ColorsType['threadStatus']> =
  {
    IN_PROGRESS: 'processing',
    COMPLETED: 'completed',
  };
