export type Evaluation = {
  evaluationId: string;
  precision: number;
  recall: number;
  f1Score: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  version: string;
};

export type EvaluationResponse = {
  success: boolean;
  code: number;
  message: string;
  data: Evaluation;
};
