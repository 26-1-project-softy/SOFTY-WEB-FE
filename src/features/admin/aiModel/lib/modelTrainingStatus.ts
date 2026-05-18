import type { TrainingJobStatus } from '@/services/admin/aiModelApi';

export const MODEL_TRAINING_STATUS_TEXT = {
  QUEUED: '대기 중',
  RUNNING: '재학습 중',
  PAUSED: '일시중지',
  COMPLETED: '완료',
  FAILED: '실패',
} satisfies Record<TrainingJobStatus, string>;

export const getModelTrainingStatusText = (status?: TrainingJobStatus | string | null) => {
  if (!status) {
    return '-';
  }

  if (status in MODEL_TRAINING_STATUS_TEXT) {
    return MODEL_TRAINING_STATUS_TEXT[status as TrainingJobStatus];
  }

  return status;
};

export const isRetrainingProgressStatus = (status?: TrainingJobStatus | null) => {
  return status === 'QUEUED' || status === 'RUNNING';
};

export const isRetrainingPausedStatus = (status?: TrainingJobStatus | null) => {
  return status === 'PAUSED';
};

export const isRetrainingCompletedStatus = (status?: TrainingJobStatus | null) => {
  return status === 'COMPLETED';
};

export const isRetrainingFailedStatus = (status?: TrainingJobStatus | null) => {
  return status === 'FAILED';
};
