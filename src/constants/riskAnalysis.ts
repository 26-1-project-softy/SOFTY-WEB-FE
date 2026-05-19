export const RISK_LEVEL = {
  SAFE: 'SAFE',
  WARNING: 'WARNING',
  UNSAFE: 'UNSAFE',
} as const;

export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL];

export const RISK_ANALYSIS_TITLE = {
  SAFE: '문제 없는 메시지예요',
  WARNING: '주의가 필요한 메시지예요',
  UNSAFE: '오해가 발생할 수 있는 메시지예요',
} satisfies Record<RiskLevel, string>;

export const RISK_ANALYSIS_DESCRIPTION = {
  SAFE: '현재 메시지는 차분하고 명확해요. 그대로 보내도 괜찮아요.',
  WARNING: '표현이 다소 모호할 수 있어요. 조금 더 명확한 문장으로 다듬어 보세요.',
  UNSAFE:
    '메시지가 상대에게 다르게 받아들여질 가능성이 있어요. 더 부드럽고 명확한 문장으로 바꿔보는 것을 추천드려요.',
} satisfies Record<RiskLevel, string>;
